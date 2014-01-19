var room = false;
var socket;
var username;
var url;
var canvas;

var docTitle = document.title;
var notifyCount = 0;
var initDone = false;

var types = {
    bool: 0,
    range: 1,
    option: 2,
};

var settings = {
    'useCustomCursor': {
        type: types.option,
        name: 'user-custom-cursor',
        text: 'Use custom cursors',
        options: [
            { name: 'both', text: 'Both' },
            { name: 'custom', text: 'Custom'},
            { name: 'off', text: 'Off'}
        ],
        val: 'off'
    },
    'waitForServer': {
        type: types.bool,
        name: 'wait-for-server',
        text: 'Wait for server',
        val: false
    },
    'useOverlay': {
        type: types.bool,
        name: 'use-overlay',
        text: 'Use overlay',
        val: false
    }
}

var cookieStrings = {
    username: 'username',
    settings: 'drawitGlobal'
};

var defaults = {
    canvasBG: '#FFFFFF',
    canvasFG: '#000000',
    defaultTool: 'pencil',
    siteURLText: 'Dr4w.it',
    roomParam: 'room'
};

var inputEvents = {
    'up': 0,
    'down': 1,
    'move': 2,
    'enter': 4,
    'leave': 5,
    'selected': 6,
    'deselected': 7,
    'load': 8
};

function createSettingsForTool(tool) {
    var div = $("<div class='tool-settings'>").empty();
    if(tool.message) {
        $("<p>").text(tool.message).css('color','red').appendTo(div);
    }
    
    if(!tool.settings) {
        return div;
    }
    
    createViewForAllSettings(tool.settings, div)
    return div;
}

function createViewForAllSettings(settings, div) {
    for(var i in settings) {
        var setting = settings[i];
        createViewForSetting(setting, div);
    }
}

function createViewForSetting(setting, div) {
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

function Canvas() {
	var self = this;

    // mouse btn up(false)/down(true)
    self.mouse = false; 
    
	self.ctx = null;
	self.overlay = null;
	
	self.fgColor = defaults.canvasFG;
	self.bgColor = defaults.canvasBG;
	
	// bounds to clear
    self.overlayData = {
        l: 0,
        t: 0,
        r: 0,
        b: 0
    };
    
	self.init = function(canvas, overlay) {
		self.ctx = $(canvas)[0].getContext('2d');
		self.ctx.canvas.width = window.innerWidth;
		self.ctx.canvas.height = window.innerHeight;
		
		self.overlay = $(overlay)[0].getContext('2d');
		self.overlay.canvas.width = window.innerWidth;
		self.overlay.canvas.height = window.innerHeight;
	}
	
	self.mousedown = function(e) {
	    self.mouse = true;
	    self.clearOverlay();
		tools[selectedTool].inputEvent(inputEvents.down, e);
	}

	self.mouseup = function(e) {
	    self.mouse = false;
	    self.clearOverlay();
		tools[selectedTool].inputEvent(inputEvents.up, e);
	}

	self.mousemove = function(e) {
        self.clearOverlay();
	    tools[selectedTool].inputEvent(inputEvents.move, e);
	}

	self.mouseenter = function(e) {
		tools[selectedTool].inputEvent(inputEvents.enter, e);
	}

	self.mouseleave = function(e) {
	    self.mouse = false;
	    self.clearOverlay();
		tools[selectedTool].inputEvent(inputEvents.leave, e);
	}

	self.sendData = function(data) {
		var fullData = {
			sender: username,
			room: room,
			data: data
		};

		if(!settings.waitForServer.val) {
			self.receiveData(fullData);
			fullData.b = 1;
		}

		socket.emit('event', fullData);
	}

    self.drawOverlay = function(data) {
        //self.overlay.save();
        if(settings.useOverlay.val) {
            self.ovclear = false;
            self.lastOverlay = data;
            tools[data.name].drawOverlay(data, self.overlay);
        }
    }
    
	self.receiveData = function(webdata) {
		tools[webdata.data.name].draw(webdata.data, self.ctx);
	}
	
	self.setLastOverlayData = function() {
	    self.overlayData.l = self.lastOverlay.start.x * 1.1;
        self.overlayData.t = self.lastOverlay.start.y * 1.1;
        self.overlayData.r = (self.lastOverlay.end.x-self.overlayData.l) * 1.1;
        self.overlayData.b = (self.lastOverlay.end.y-self.overlayData.t) * 1.1;
	}
	
	self.clearOverlay = function() {
	    if(!self.ovclear) {
	        self.ovclear = true;
	        //self.setLastOverlayData();
	        //self.overlay.clearRect(self.overlayData.l,self.overlayData.t, self.overlayData.r, self.overlayData.b);
	        self.overlay.clearRect(0,0, self.overlay.canvas.width, self.overlay.canvas.height);
	        //self.overlay.restore();
	    }
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
			tools[$(this).attr('name')].inputEvent(inputEvents.selected, {});
	});	
}

function selectTool(toolName) {
    if(selectedTool) {
        tools[selectedTool].inputEvent(inputEvents.deselected, {});
        saveSettingsForTool(selectedTool);
    }
    
	selectedTool = toolName;
	$("#toolSettings").empty();
	createSettingsForTool(tools[selectedTool]).appendTo("#toolSettings");
	tools[selectedTool].setupDeps();
	
	if(settings.useCustomCursor.val == "custom")
	    $("canvas").css('cursor', tools[selectedTool].cursor?tools[selectedTool].cursor:"default");
	else {
	    $("canvas").css('cursor', "default");
	}
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
	var div = $("<div>").addClass("chatMessage");
	$(div).appendTo($("#chatOutput"))
	
	$("<span>").addClass("chatMessageSender").text(data.sender).appendTo($(div));
	$("<span>").addClass("chatMessageText").text(": " + data.message).appendTo($(div));
	
	var co = document.getElementById('chatOutput');
	co.scrollTop = co.scrollHeight;
	
	notify();
}

function loadSettingsForTool(toolname, settings) {
    if(!settings)
        return;
    for(var i in settings) {
        var val = $.cookie(toolname + settings[i].name);
        if(val != undefined) {
            if(settings[i].type == types.bool)
                settings[i].val = val==1;
            else
                settings[i].val = val;
        }
    }
}

function saveSettingsForTool(toolname, settings) {
    if(!settings)
        return;
    
    for(var i in settings) {
        var val = settings[i].val;
        if(settings[i].type == types.bool)
            val = settings[i].val?1:0;
        $.cookie(toolname + settings[i].name, val);
    }
}

function buildSettingsPage() {
    var div = $("<div class='tool-settings'>").empty();
    createViewForAllSettings(settings, div);
    $(div).appendTo("#settingsWrapper");
}

$(function() {
    canvas = new Canvas();
	canvas.init("#canvas", "#overlayCanvas");
    $("canvas").mousedown(canvas.mousedown)
		.mouseup(canvas.mouseup)
		.mousemove(canvas.mousemove)
		.mouseleave(canvas.mouseleave)
		.mouseenter(canvas.mouseenter);
    
    loadSettingsForTool(cookieStrings.settings, settings);
    
    $(window).unload(function(e) {
        saveSettingsForTool(cookieStrings.settings, settings);
        for(var i in tools) {
            saveSettingsForTool(i, tools[i].settings);
        }
    });
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
	
	socket.on(socketEvents.chat, function(data)    { addToChat(data); });
	socket.on(socketEvents.event, function(data)   { canvas.receiveData(data); });

	socket.on(socketEvents.playerEvent, function(data) { 
	    data.message = data.name + (data.left?' left':' joined');
		addToChat(data);
	});

    socket.on(socketEvents.join, function(data) {
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
    
    socket.on(socketEvents.disconnect, function () {
        addToChat({ sender: "Interwebs", message: "Server disconnected, trying to reconnect!!"});
    });
    
    socket.on(socketEvents.reconnect, function () {
        addToChat({ sender: "Interwebs", message: "Server reconnected, trying to rejoin"});
        socket.emit(socketEvents.join, { name: username, room: room });
    });
    
    socket.on(socketEvents.playerList, function(data) {
        $("#partListWrapperList").empty();	
		for(var i = 0; i < data.plist.length; i++) {
			$("<li>").text(data.plist[i]).appendTo("#partListWrapperList");
		}
    });
    
    $("#ButtonPassword").click(function(e) {
        var pass = $("#InputPassword").val();
        if(pass.trim() != "") {
            socket.emit(socketEvents.join, { name: username, room: room, pw: pass });
            $("#WaitingDialog").dialog("open");
        }
    });
    
    socket.emit(socketEvents.join, { name: username, room: room });
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

    var w = 0;
    $(".window").each(function() {
        $(this).draggable({ handle: $(this).children(".windowHeader")[0], constrainment: "#main", scroll: false})
            .css('left', 10 + ($(this).width()+25) * w++);
    });
    
    /*
	$("#div_chat").draggable({ handle: "#chatHeader", constrainment: "#main", scroll: false })
	.css({ 'top': 5, 'right': 5}); // start chat in upper right corner
		
	$("#toolMenu").draggable({ handle: "#toolMenuHeader", constrainment: "#main", scroll: false});
	$("#div_part_list").draggable( { handle: "#partListHeader", constrainment: "#main", scroll: false});
	$("#div_settings").draggable({ handle: "#settingsHeader", constrainment: "#main", scroll: false });
	*/
	$(".windowHeader").disableSelection();
    
    buildSettingsPage();
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
    $("#settingsHeaderClose").click();
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
					loadSettingsForTool(tool.name, tools[tool.name].settings);
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
