function Pencil() {
	var self = this;
	
	self.width = 2;
	self.name = "pencil";
	self.description = "Just a pencil";
	self.icon = "/images/icons/pencil.png";
	self.mouse = false;	
	self.prevPos = null;
    self.smooth = true;
    
	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		/*
		$("<input type='number' id='pencil-width' value='" + self.width + "'>").change(function() {
			self.width = $(this).val();
		}).appendTo(div);
		*/
		
		$("<span>").attr('id', 'pencilWidthView').text( self.width )
            .appendTo($("<p>").text("Width: ").appendTo(div));
       
		$("<div>").slider({
            range: "max",
            value: self.width,
            min: 2,
            max: 40,
            slide: function( event, ui ) {
                self.width = ui.value;
                $("#pencilWidthView").text(ui.value);
            }
        }).attr('id', 'pencilWidthSlider')
        .addClass('toolSlider')
        .appendTo(div);
		
		return div;
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				self.mouse = true;
				self.prevPos = { x: e.pageX, y: e.pageY };
				break;
			case "up":
			case "leave":
				self.mouse = false;
				break;
			case "move":
				if(self.mouse) {
					var data = {
						start: self.prevPos,
						end: { x: e.pageX, y: e.pageY },
						name: self.name,
						config: { 
							width: self.width,
							color: self.canvas.fgColor
						}
					};
					self.prevPos = data.end;
					self.canvas.sendData(data);
				}
				break;
		}
	}

	self.draw = function(data) {
	    // Draw regular
		self.canvas.ctx.beginPath();
		self.canvas.ctx.moveTo(data.start.x, data.start.y);
		self.canvas.ctx.lineTo(data.end.x, data.end.y);
		self.canvas.ctx.lineWidth = data.config.width;
		self.canvas.ctx.strokeStyle = data.config.color;
		self.canvas.ctx.stroke();
		
		// draw circle in end of line
		if(self.smooth && +data.config.width > 1) {
		    self.canvas.ctx.beginPath();
		    var cx = Math.floor(data.end.x);
		    var cy = Math.floor(data.end.y);
		
		    
		    self.canvas.ctx.arc(cx, cy, data.config.width/2, 0, 2*Math.PI, false);
            self.canvas.ctx.fillStyle = data.config.color;
			self.canvas.ctx.fill();
		    //self.canvas.ctx.strokeStyle = data.config.color;
		    //self.canvas.ctx.lineWidth = data.config.width;
		    //self.canvas.ctx.stroke();
		}
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new Pencil();
tools[tool.name] = tool;

console.log("PENCIL LOADED");
