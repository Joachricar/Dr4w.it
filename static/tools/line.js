function LineTool() {
	var self = this;
	
	self.width = 2;
	self.name = "line";
	self.description = "Line tool";
	self.icon = "/images/icons/lineTool.png";

	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		$("<span>").attr('id', 'lineWidthView').text( self.width )
            .appendTo($("<p>").text("Width: ").appendTo(div));
       
		$("<div>").slider({
            range: "max",
            value: self.width,
            min: 2,
            max: 40,
            slide: function( event, ui ) {
                self.width = ui.value;
                $("#lineWidthView").text(ui.value);
            }
        }).attr('id', 'lineWidthSlider')
        .addClass('toolSlider')
        .appendTo(div);
		return div;
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case "up":
				self.endPos = { x: e.pageX, y:e.pageY };

				var data = {
					start: self.startPos,
					end: self.endPos,
					name: self.name,
					config: { 
						width: self.width,
						color: self.canvas.fgColor
					}
				};
				self.prevPos = data.end;
				self.canvas.sendData(data);
				break;
		}
	}

	self.draw = function(data) {
		self.canvas.ctx.beginPath();
		self.canvas.ctx.moveTo(data.start.x, data.start.y);
		self.canvas.ctx.lineTo(data.end.x, data.end.y);
		self.canvas.ctx.lineWidth = data.config.width;
		self.canvas.ctx.strokeStyle = data.config.color;
		self.canvas.ctx.stroke();
		
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new LineTool();
tools[tool.name] = tool;

console.log("PENCIL LOADED");
