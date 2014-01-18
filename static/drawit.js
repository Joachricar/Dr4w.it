var room = false;
var socket;
var username;
var url;
var canvas;

var docTitle = document.title;
var notifyCount = 0;
var initDone = false;

var cookieStrings = {
    username: 'username',
    clientSideFirst: 'clientSideFirst'
};

var urlStrings = {
    toolList: '/toollist.json',
    frontPage: '/front.html',
    protocol: 'http://',
    toolFolder: '/tools/'
};

var defaults = {
    canvasBG: '#FFFFFF',
    canvasFG: '#000000',
    defaultTool: 'pencil',
    siteURLText: 'Dr4w.it',
    roomParam: 'room'
};

var types = {
    bool: 0,
    range: 1,
    option: 2,
};

function createSettingsForTool(tool) {
    var div = $("<div class='tool-settings'>").empty();
    if(tool.message) {
        $("<p>").text(tool.message).css('color','red').appendTo(div);
    }
    
    if(!tool.settings) {
        return div;
    }
    
    for(var i in tool.settings) {
        var setting = tool.settings[i];
        createViewForSetting(tool, setting, div);
    }
    
    return div;
}

function createViewForSetting(tool, setting, div) {
    switch(setting.type) {
        case types.bool:
            createCheckboxWithLabel(setting.val, setting.text, setting.name, div, function(val) {
	            setting.val = val;
	        });
	        $("<br>").appendTo(div);
            break;
        case types.range:
            createSlider(setting.val, setting.min, setting.max, setting.text, setting.name, div, function(val) {
	            setting.val = val;
	        });
	        break;
	    case types.option:
	        createSelectWithLabel(setting.val, setting.options, setting.text, setting.name, div, function(val) {
	            setting.val = val;
	        });
	        $("<br>").appendTo(div);
	        break;
    }
}

// Check window focus
var window_focus;
$(window).focus(function() {
    window_focus = true;
    setDocTitle(docTitle)
    notifyCount = 0;
}).blur(function() {
    window_focus = false;
});

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

function askForRoomName() {
	window.location.href = url + urlStrings.frontPage;
}

String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g, '');
};

var port = window.location.port;
var domain = window.location.hostname;
url = urlStrings.protocol + domain + (port?":"+port:"");

var params = getQueryParams(document.location.search);

// REDIRECT TO FRONTPAGE IF NO ROOM IS SPECIFIED
room = params[defaults.roomParam];

if(!room)
    askForRoomName();

function sendMessage(message) {
	socket.emit('chat', { sender: username, message: message, room: room });
}

var tools = [];
var selectedTool;
var clientSideFirst = $.cookie(cookieStrings.clientSideFirst);

function Canvas() {
	var self = this;

	self.ctx = null;
	
	self.fgColor = defaults.canvasFG;
	self.bgColor = defaults.canvasBG;

	self.init = function(canvas) {
		self.ctx = $(canvas)[0].getContext('2d');
		self.ctx.canvas.width = window.innerWidth;
		self.ctx.canvas.height = window.innerHeight;
	}

	self.mousedown = function(e) {
		tools[selectedTool].inputEvent("down", e);
	}

	self.mouseup = function(e) {
	    //console.dir(self.ctx.getImageData(e.pageX, e.pageY, 1, 1));
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

		if(clientSideFirst) {
			self.receiveData(fullData);
			fullData.b = 1;
		}

		socket.emit('event', fullData);
	}

	self.receiveData = function(data) {
		tools[data.data.name].draw(data.data);
	}
}

function setForeground(color) {
    $("#fgColor").val(color);
    canvas.fgColor = $("#fgColor").val();
    updateColorInputs();
}

function clearToolList() {
    $("#toolSettings").empty();
    $("#toolMenuSelector").empty();
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
			tools[$(this).attr('name')].inputEvent("selected", {});
	});	
}

function selectTool(toolName) {
	selectedTool = toolName;	
	$("#toolSettings").empty();
	createSettingsForTool(tools[selectedTool]).appendTo("#toolSettings");
	tools[selectedTool].setupDeps();
}

function setDocTitle(str) {
    $(document).attr("title", (str));
}
function notify() {
    if(!window_focus) {
        setDocTitle("(" + ++notifyCount + ")" + docTitle);
    }
}

function addToChat(data) {
    /*
	var prevText = $("#chatOutput").text();
	$("#chatOutput").text(prevText + "\n" + data.sender + ": " + data.message);
	var textarea = document.getElementById('chatOutput');
	textarea.scrollTop = textarea.scrollHeight;
	*/
	
	var div = $("<div>").addClass("chatMessage");
	$(div).appendTo($("#chatOutput"))
	
	$("<span>").addClass("chatMessageSender").text(data.sender).appendTo($(div));
	$("<span>").addClass("chatMessageText").text(": " + data.message).appendTo($(div));
	
	var co = document.getElementById('chatOutput');
	co.scrollTop = co.scrollHeight;
	
	notify();
}

$(function() {
    $(".fpInput").keydown(function(e) {
        if(e.key == "Enter") {
            $(this).nextAll(".fpButton").click();
        }
    });
    
    $("#mainContent").hide("fast");
    $("#NameDialog").dialog({
        modal: true,
        resizable: false,
        closeOnEscape: false
    });
    
    if($.cookie(cookieStrings.username))
        $("#InputUsername").val($.cookie(cookieStrings.username));
    
    $("#WaitingDialog").dialog({
        modal: true,
        resizable: false,
        closeOnEscape: false
    }).dialog("close");
    
    $("#PasswordDialog").dialog({
        modal: true,
        resizable: false,
        closeOnEscape: false
    });
    
    $("#PasswordDialog").dialog("close");
    
    $(".ui-button-icon-only").hide();
    
    $("#ButtonJoinRoom").click(function(e) {
        var temp = $("#InputUsername").val();
        
        if(temp.trim() != "") {
            $("#NameDialog").dialog("close");
            $("#WaitingDialog").dialog("open");
            username = temp;
            $.cookie(cookieStrings.username, temp);
            
            initSocket();
        }
    });
	//username = prompt("was ist dein name?");
});

function initSocket() {
	socket = io.connect(url);
	
	socket.on('chat', function(data) {
		addToChat(data);
	});

	socket.on('event', function(data) {
		canvas.receiveData(data);
	});

	socket.on('playerEvent', function(data) {
		data.message = data.name + (data.left?' left':' joined');
		addToChat(data);
		$("#partListWrapperList").empty();	
		for(var i = 0; i < data.plist.length; i++) {
			$("<li>").text(data.plist[i]).appendTo("#partListWrapperList");
		}
	});

    socket.on('join', function(data) {
        $("#WaitingDialog").dialog("close");
        if(data.accept) {
            $("#PasswordDialog").dialog("close");
            initRest();
        }
        else {
            $("#PasswordDialogMessage").text(data.message);
            $("#PasswordDialog").dialog("open");
        }
    });
    
    socket.on('disconnect', function () {
        addToChat({ sender: "Interwebs", message: "Server disconnected, trying to reconnect!!"});
    });
    
    socket.on('reconnect', function () {
        addToChat({ sender: "Interwebs", message: "Server reconnected, trying to rejoin"});
        socket.emit('join', { name: username, room: room });
    });
    
    $("#ButtonPassword").click(function(e) {
        var pass = $("#InputPassword").val();
        if(pass.trim() != "") {
            socket.emit('join', { name: username, room: room, pw: pass });
            $("#WaitingDialog").dialog("open");
        }
    });
    
    socket.emit('join', { name: username, room: room });
}

function initRest() {
    if(initDone) // we don't wanna run this on reconnect
        return;
    
    $("#mainContent").show("fast");
    
	$("#chatInput").keyup(function(e) {
		if(e.which == 13) {
			sendMessage($("#chatInput").val());
			$("#chatInput").val("");
		}
	});

	$("#div_chat").draggable({ handle: "#chatHeader", constrainment: "#main", scroll: false })
	.css({ 'top': 5, 'right': 5}); // start chat in upper right corner
		
	$("#toolMenu").draggable({ handle: "#toolMenuHeader", constrainment: "#main", scroll: false});
	$("#div_part_list").draggable( { handle: "#partListHeader", constrainment: "#main", scroll: false});
	$(".windowHeader").disableSelection();

	canvas = new Canvas();
	canvas.init("#canvas");
    $("#canvas").mousedown(canvas.mousedown)
		.mouseup(canvas.mouseup)
		.mousemove(canvas.mousemove)
		.mouseleave(canvas.mouseleave)
		.mouseenter(canvas.mouseenter);
    
	loadTools();

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
			$(p).show("fast").mousedown();
			$(this).remove();
		}).appendTo("#footerWindowMenu").addClass("footerWindowMenuButton");
		$(p).hide("fast");
	}).text("X");

	$("#partListClose").click(); // to hide by default

	$("#fgColor").change(function() {
		canvas.fgColor = $("#fgColor").val();
	}).val(canvas.fgColor);

	$("#bgColor").change(function() {
		canvas.bgColor = $("#bgColor").val();
	}).val(canvas.bgColor);

	$("<a>").attr('href', url)
	    .attr('target', '_blank')
	    .text(defaults.siteURLText)
	    .appendTo("#footerTitle");
	
	$("#clientSideFirst").attr("checked", clientSideFirst?"checked":"unchecked");
	$("#clientSideFirst").change(function() {
		clientSideFirst = $(this).is(":checked");
		$.cookie(cookieStrings.clientSideFirst, clientSideFirst);
		console.log(clientSideFirst);
	});
	
	$("#flipColorButton").click(function(e) {
	    var bgColor = canvas.bgColor;
	    var fgColor = canvas.fgColor;
	    
	    $("#fgColor").val(bgColor);
	    $("#bgColor").val(fgColor);
	    
	    canvas.fgColor = bgColor;
	    canvas.bgColor = fgColor;
	    
	    updateColorInputs();
	});
	
	updateColorInputs();
	initDone = true;
}

function updateColorInputs() {
    $('.color').each(function() {
        document.getElementById($(this).attr('id')).color.fromString($(this).val());
    }); 
}
function loadTools() {
    clearToolList();
    $.ajax({
		url: url + urlStrings.toolList,
		success: function(data) {
			var toollist = eval(data);
	    	for(var i = 0; i < toollist.length; i++) {
	        	$.get(url + urlStrings.toolFolder + toollist[i], function(d) {
	            	buildToolMenuFor(tool);
					tool.setCanvas(canvas);
					selectTool(tool.name);
					selectTool(defaults.defaultTool); // bare fordi vi vil ikke begynne med bucket, lulz
	        	});
	    	}
		},
		error: function(XMLHttpRequest, stat, error) {
			alert("Error loading tools: " + error + " " + stat);
			console.dir(stat);
			console.dir(error);
		}
	});
}

// Init value
function createSlider(initVal, minVal, maxVal, text, name, div, func) {
    $("<span>").attr('id', name + 'View').text( initVal )
        .appendTo($("<p>").text(text + ": ").appendTo(div).addClass('sliderLabel'));
   
	return $("<div>").slider({
        range: "max",
        value: initVal,
        min: minVal,
        max: maxVal,
        slide: function( event, ui ) {
            
            $("#"+name+"View").text(ui.value);
            
            func(ui.value);
        }
    }).attr('id', name + 'Slider')
    .addClass('toolSlider').appendTo(div);
}

function createCheckboxWithLabel(initVal, text, name, div, func) {
    var inp = $("<input>").attr({
        'type': 'checkbox',
        'name': name,
        'id': name,
        'checked': initVal})
		.change(function() {
		    func($(this).is(":checked"));
	}).appendTo(div);
	$("<label>").attr("for", name).text(text).appendTo(div);
	return inp;
}

function createSelectWithLabel(val, options, text, name, div, func) {
    var s = $("<select>").attr('name',name).attr('id', name).appendTo(div).change(function() {
        func($(this).val());
    }).addClass("tool-select");
    
    $('<label>').attr('for', name).text(text).appendTo(div);
    for(var i in options) {
        var opt = $("<option>").attr('value', options[i].name).text(options[i].text).appendTo(s)
        if(val == options[i].name) {
            $(opt).attr('selected','selected');
        }
    }
    return s;
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

