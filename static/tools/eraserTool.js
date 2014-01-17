function Eraser() {
	var self = this;
	
	self.width = 20;
	self.name = "eraser";
	self.description = "Just an eraser";
	self.icon = "/images/icons/eraserTool.png";
	self.mouse = false;	
	self.prevPos = null;
    self.smooth = true;
    
	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		
		$("<span>").attr('id', 'eraserWidthView').text( self.width )
            .appendTo($("<p>").text("Width: ").appendTo(div));
       
		$("<div>").slider({
            range: "max",
            value: self.width,
            min: 2,
            max: 60,
            slide: function( event, ui ) {
                self.width = ui.value;
                $("#eraserWidthView").text(ui.value);
            }
        }).attr('id', 'eraserWidthSlider')
        .addClass('toolSlider')
        .appendTo(div);
		
		return div;
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				self.mouse = true;
				break;
			case "up":
			case "leave":
				self.mouse = false;
				break;
			case "move":
				if(self.mouse) {
					var data = {
						pos: { x: e.pageX, y: e.pageY },
						name: self.name,
						config: { 
							width: self.width,
						}
					};
					self.prevPos = data.end;
					self.canvas.sendData(data);
				}
				break;
		}
	}

	self.draw = function(data) {
	    // TODO clear rect hele veien
	    // elns
	    // Draw regular
		self.canvas.ctx.clearRect(
		    data.pos.x-(data.config.width/2), 
		    data.pos.y-(data.config.width/2), 
		    data.config.width, 
		    data.config.width);
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new Eraser();
tools[tool.name] = tool;

console.log("ERASER LOADED");
