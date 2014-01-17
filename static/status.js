var url;

$(function() {
    var port = window.location.port;
	var domain = window.location.hostname;
	url = "http://" + domain + (port?":"+port:"");
	loadRoomList();
});

function addRoom(r, data) {
    var div = $("<div>").addClass("roomDiv").appendTo($("#roomListWrapper"));
    var nd = $("<div>").addClass("roomNameDiv").text(data.name).appendTo(div).click(function(e) {
        $(this).next('.participantListDiv').toggle();
    });
    
    if(data.password) {
        $("<img>").attr("src", "/images/padlock.png")
                .attr('title', 'This room is password protected')
                .appendTo(nd).css('float', 'right');
    }
    
    var plist = $("<div>").addClass('participantListDiv').appendTo(div).hide("fast");
    
    for(var p in data.participants) {
        $("<div>").addClass('participantListElem').text(data.participants[p]).appendTo(plist);
    }
}

function buildRoomList(data) {
    var list = JSON.parse(data);
    
    if(list.length == 0) {
        var div = $("#welcomeMessage").text("No rooms :(");
    }
   
    for(var i in list) {
        addRoom(i, list[i]);
    }
}

function loadRoomList() {
    $.ajax({
		url: url + '/status.json',
		success: function(data) {
			buildRoomList(data);
			$("#roomListLoader").remove();
			//$("#dbg").text(data);
		},
		error: function(XMLHttpRequest, stat, error) {
			alert("Status: " + stat); alert("Error: " + error);
			console.dir(stat);
			console.dir(error);
		}
	});
}
