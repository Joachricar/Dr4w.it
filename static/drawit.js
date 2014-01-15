var room = false;
var socket;
var username;
var url;
var canvas;

// Stolen from stack-overflow
function getQueryParams(qs) {
	qs = qs.split("+").join(" ");
	var params = {}, tokens,
	re = /[?&]?([^=]+)=([^&]*)/g;

	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}

var params = getQueryParams(document.location.search);


function askForRoomName() {
	alert("no room")
	room = "default";
}

function sendMessage(message) {
	socket.emit('chat', { sender: username, message: message, room: room });
}

var tools = [];
var selectedTool;

function Canvas() {
	var self = this;

	self.ctx = null;
	
	self.fgColor = "#000000";
	self.bgColor = "#FFFFFF";

	self.init = function(canvas) {
		self.ctx = $(canvas)[0].getContext('2d');
		self.ctx.canvas.width = window.innerWidth;
		self.ctx.canvas.height = window.innerHeight;
	}

	self.mousedown = function(e) {
		tools[selectedTool].inputEvent("down", e);
	}

	self.mouseup = function(e) {
		tools[selectedTool].inputEvent("up", e);
	}

	self.mousemove = function(e) {
		tools[selectedTool].inputEvent("move", e);
	}

	self.mouseenter = function(e) {
		tools[selectedTool].inputEvent("enter", e);
	}

	self.mouseleave = function(e) {
		tools[selectedTool].inputEvent("leave", e);
	}

	self.sendData = function(data) {
		var fullData = {
			sender: username,
			room: room,
			data: data
		};

		socket.emit('event', fullData);
	}

	self.receiveData = function(data) {
		tools[data.data.name].draw(data.data);
	}
}

function buildToolMenuFor(t) {
	$("<img>")
		.attr('src', t.icon)
		.attr('alt', t.description)
		.attr('title', t.description)
		.attr('name', t.name)
		.addClass('tool-button')
		.appendTo('#toolMenuSelector')
		.click(function(e) {
			selectTool($(this).attr('name'));
			$(".tool-button").removeClass('selected-tool-button');
			$(this).addClass('selected-tool-button');

	});	
}

function selectTool(toolName) {
	selectedTool = toolName;	
	$("#toolSettings").empty();
	$(tools[selectedTool].buildMenu()).appendTo("#toolSettings");
}

$(function() {
	url = "http://" + drawitconfig.url+":"+drawitconfig.port;
	console.log("START");
	console.log(url);
	console.dir(drawitconfig);
	console.log("END");
	room = params['room'];
	if(!room)
		askForRoomName();
	username = prompt("was ist dein name?");

	socket = io.connect(url);
	socket.on('chat', function(data) {
		var prevText = $("#chatOutput").text();
		$("#chatOutput").text(prevText + "\n" + data.sender + ": " + data.message);
		var textarea = document.getElementById('chatOutput');
		textarea.scrollTop = textarea.scrollHeight;
	});

	socket.on('event', function(data) {
		canvas.receiveData(data);
	});

	socket.emit('join', { name: username, room: room });

	$("#chatInput").keyup(function(e) {
		if(e.which == 13) {
			sendMessage($("#chatInput").val());
			$("#chatInput").val("");
		}
	});

	$("#div_chat").draggable({ handle: "#chatHeader", constrainment: "#main", scroll: false });
	$("#chatHeader").disableSelection();
	
	$("#toolMenu").draggable({ handle: "#toolMenuHeader", contrainment: "#main", scroll: false});
	$("#toolMenuHeader").disableSelection();

	canvas = new Canvas();
	canvas.init("#canvas");

	$.ajax({
		url: url + '/toollist.json',
		success: function(data) {
			var toollist = eval(data);
	     
	    	for(var i = 0; i < toollist.length; i++) {
	        	$.get(url + '/tools/' + toollist[i], function(d) {
	            	buildToolMenuFor(tool);
					tool.setCanvas(canvas);
					selectTool(tool.name);
	        	});
	    	}
		},
		error: function(XMLHttpRequest, stat, error) {
			alert("Status: " + stat); alert("Error: " + error);
			console.dir(stat);
			console.dir(error);
		}
	});

	$("#canvas").mousedown(canvas.mousedown)
		.mouseup(canvas.mouseup)
		.mousemove(canvas.mousemove)
		.mouseleave(canvas.mouseleave)
		.mouseenter(canvas.mouseenter);
	
	$(".window").mousedown(function(e) {
		$(".window").css('z-index', '0');
		$(this).css('z-index', '1');
	});

	$(".window").each(function() {
		var title = $(this).attr('title');
		$(this).find(".windowHeaderText").text(title);
	});

	$(".windowHide").click(function() {
		$(this).parents( ".window" ).children(".windowWrapper").toggle();
	}).text("-");

	$(".windowClose").click(function() {
		var p = $(this).parents(".window");
		var a = $("<p>").text($(p).attr('title')).click(function(e) {
			$(p).show("fast");
			$(this).remove();
		}).appendTo("#footerWindowMenu").addClass("footerWindowMenuButton");
		$(p).hide("fast");
	}).text("X");
	$("#fgColor").change(function() {
		canvas.fgColor = $("#fgColor").val();
	}).val(canvas.fgColor);

	$("#bgColor").change(function() {
		canvas.bgColor = $("#bgColor").val();
	}).val(canvas.bgColor);

	$("<a>").attr('href', url).text(drawitconfig.name).appendTo("#footerTitle");
});











