var express = require('express'),
    app = express();

var fs = require('fs');

app.get('/toollist.json', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    var data = fs.readdirSync(toolListPath);
    console.dir(data);
    res.end(JSON.stringify(data));
});

app.use('/', express.static(__dirname+'/static'));	
server = app.listen(8787);

var toolListPath = "static/tools/";

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
