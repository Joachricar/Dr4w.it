var logging = true;
var express = require('express'),
    app = express();

var fs = require('fs');
var crypto = require('crypto');

function read(f){return fs.readFileSync(f).toString()};
function include(f){eval.apply(global,[read(f)])}; 

var SERV_TAG = 'Dr4w.it'; // for chat messages from server
var toolListPath = "static/tools/";

include('static/drawitconfig.js');
include('static/shareddata.js');

// -----------------------
// GET TOOLS
app.get(urlStrings.toolList, function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    var data = fs.readdirSync(toolListPath);
    res.end(JSON.stringify(data) + "\n", null, 3);
});

// ---------------------------
// GET STATUS OF SITE(users, rooms)
app.get(urlStrings.statusData, function(req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.end(JSON.stringify(rooms) + "\n", null, 3);
});

console.log(drawitconfig.url+":"+drawitconfig.port);
app.use('/', express.static(__dirname+'/static'));	

server = app.listen(drawitconfig.port);

// -------------------------------
// SOCKET.IO HANDLING
io = require('socket.io').listen(server, {log: false});
io.on('connection', function(socket) {
	socket.emit(socketEvents.chat, { sender: 'Dr4w.it', message: 'Welcome to Dr4w.it!' });
	
	socket.rooms = new Array();

    socket.on(socketEvents.join, function(data) {
        if(!rooms[data.room] || !rooms[data.room].hasPass()) {  // no such room, or room isn't protected
            socket.emit(socketEvents.join, { accept: true });
            joined(data);
        }
        else {                                                  // room has password
            if(!data.pw) {                                      // ... but user hasn't provided password
                socket.emit(socketEvents.join, { accept: false, message: "Enter password" });
            }
            else {                                              // ... user has provided password 
                if(!rooms[data.room].checkPassword(data.pw)) {  // ... which is wrong
                    socket.emit(socketEvents.join, { accept: false, message: "Wrong password" });
                }
                else {                                          // ... which is correct
                    socket.emit(socketEvents.join, { accept: true });
                    joined(data);
                }
            }
        }
    });

    
    function joined(data) {
	    socket.join(data.room);
	    
		if(!rooms[data.room]) {
			rooms[data.room] = new Room(data.room);
		}
		
		rooms[data.room].addParticipant(socket, data.name);
		socket.rooms.push(data.room);
	}
    
    socket.on(socketEvents.imageDataRequest, function(data) {
	    var first = Object.keys(rooms[data.room].participants)[0];
	    
	    if(first != undefined && first != socket.id) { 
	        // get from first in room
	        // TODO do some better picking
	        var req = {
	            room: data.room,
	            to: socket.id
	        }
	        
	        log(socket.id + " requesting image data from " + first);       
	        io.sockets.socket(first).emit(socketEvents.imageDataRequest, req);
	    }
	    else { // no data to send
	        log(socket.id + " asked for image data, but the room is empty");    
	        socket.emit(socketEvents.imageDataReceived, {});
	    }
    });
    
    socket.on(socketEvents.imageDataReceived, function(data) {
        log("Image data from " + socket.id + " to " + data.to);
        io.sockets.socket(data.to).emit(socketEvents.imageDataReceived, data);
    });
    
	socket.on(socketEvents.chat, function(data) {
		io.sockets.in(data.room).emit(socketEvents.chat, data);
	});

    socket.on(socketEvents.createRoom, function(data) {
		if(!rooms[data.room]) {
		    socket.emit(socketEvents.createResponse, { accept: true, room: data.room });
		    rooms[data.room] = new Room(data.room);
		    
		    if(data.pw != "")
		        rooms[data.room].setPassword(data.pw);
		}
		else {
		    socket.emit(socketEvents.createResponse, { accept: false, pw: rooms[data.room].hasPass() });
		}
	});
	
	socket.on(socketEvents.event, function(data) {
		if(data.b)
			socket.broadcast.to(data.room).emit(socketEvents.event, data);
		else
			io.sockets.in(data.room).emit(socketEvents.event, data);
	});
	
	socket.on(socketEvents.disconnect, function(data) {
		for(var i = 0; i < socket.rooms.length; i++) {
			rooms[socket.rooms[i]].removeParticipant(socket);
			if(rooms[socket.rooms[i]].getNames().length == 0) {
				delete rooms[socket.rooms[i]];
			}
			socket.leave(socket.rooms[i]);
		}
		socket.rooms = null;
	});
});

var rooms = new Object();

// ------------------------------
// ROOM CLASS TO STORE NAMES+SOCKET
function Room(name) {
	var self = this;
	
	self.name = name;
	self.participants = {};
	
	self.getNames = function() {
		var arr = new Array();
		for(var i in self.participants)
			arr.push(self.participants[i]);
		return arr;
	};

	self.addParticipant = function(socket, pname) {
		self.participants[socket.id] = pname;
		var names = self.getNames();
		//dir(names);
		socket.broadcast.to(self.name).emit(socketEvents.playerEvent, { sender: SERV_TAG, name: pname });
		io.sockets.in(self.name).emit(socketEvents.playerList, { plist: names });
	};

	self.removeParticipant = function(socket) {
		var pname = self.participants[socket.id];
		delete self.participants[socket.id];
		var names = self.getNames();
		//log(names);
		
		io.sockets.in(self.name).emit(socketEvents.playerEvent, { 
				sender: SERV_TAG,
				left: true,
				name: pname }
		);
		
		io.sockets.in(self.name).emit(socketEvents.playerList, { plist: names });
	};
	
    self.checkPassword = function(pass) {
        pass = crypto.createHash('md5').update(pass).digest('hex');
        if(pass == self.password) {
            log("PASSED");
            return true;
        }
        else {
            log("FAILED: " + pass + " " + self.password);
            return false;
        }
    };
    
	self.setPassword = function(pass) {
	    self.password = crypto.createHash('md5').update(pass).digest('hex');
	};
	
	self.hasPass = function() {
	    return self.password != null;
	};
}

function log(msg) {
	if(logging)
		console.log(msg);
}
function dir(obj) {
	if(logging)
		console.dir(obj);
}
