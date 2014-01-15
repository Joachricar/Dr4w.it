var express = require('express'),
    app = express();

var fs = require('fs');

function read(f){return fs.readFileSync(f).toString()};
function include(f){eval.apply(global,[read(f)])}; 

var toolListPath = "static/tools/";
include('static/drawitconfig.js');

app.get('/toollist.json', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    var data = fs.readdirSync(toolListPath);
    console.dir(data);
    res.end(JSON.stringify(data) + "\n", null, 3);
});

console.log(drawitconfig.url+":"+drawitconfig.port);
app.use('/', express.static(__dirname+'/static'));	

server = app.listen(drawitconfig.port);


io = require('socket.io').listen(server);
io.on('connection', function(socket) {
	socket.emit('chat', { sender: 'Dr4w.it', message: 'Heisann!' });

	socket.on('join', function(data) {
		socket.join(data.room);
		io.sockets.in(data.room).emit('chat', { sender: 'Dr4w.it', message: data.name + ' joined this session' });
	});

	socket.on('chat', function(data) {
		io.sockets.in(data.room).emit('chat', data);
	});

	socket.on('event', function(data) {
		io.sockets.in(data.room).emit('event', data);
	});
});
