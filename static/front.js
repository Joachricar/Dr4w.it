$(function() {
    var port = window.location.port;
	var domain = window.location.hostname;
	url = "http://" + domain + (port?":"+port:"");
	
	socket = io.connect(url);
	socket.on('createResponse', function(data) {
	    $("#WaitingDialog").dialog("close");
	    if(data.accept) {
	        window.location.href = url + "/?room=" + data.room;
	    } 
	    else {
	        roomExist(data);
	    }
	});
	
	$("#WaitingDialog").dialog({
        modal: true,
        resizable: false,
        closeOnEscape: false
    }).dialog("close");
    
    $("#ButtonCreateRoom").click(function(e) {
        $("#WaitingDialog").dialog("open");
        socket.emit('createRoom', { room: $("#InputRoomName").val(), pw: $("#InputPassword").val()});
    });
    
    $("#ExistingRoomDialog").dialog({ 
        modal: true,
        resizable: false,
        autoOpen: false
    }).dialog("close");
    
    $("#JoinRoom").click(function(e) {
        window.location.href = url + "/?room=" + $("#InputRoomName").val();
    });
    
    $("#CloseDialog").click(function(e) {
        $("#ExistingRoomDialog").dialog("close");
    });
    
    $(".fpInput").keydown(function(e) {
        if(e.key == "Enter") {
            $(this).nextAll(".fpButton").click();
        }
    });
});

function roomExist(data) {
    $("#ExistingRoomDialog").dialog("open");
    $("#WithPW").text(data.pw?("and is password protected"):"");
}

