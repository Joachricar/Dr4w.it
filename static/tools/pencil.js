function Pencil() {
	var self = this;
	
	self.width = 2;
	self.name = "pencil";
	self.description = "Just a pencil";
	self.icon = "/images/icons/pencil.png";
	self.prevPos = null;
    self.cursor = "none";
    
    self.settings = {
        'width': {
            type: types.range,
            text: 'Line Width',
            name: 'pencil-width',
            val: 2,
            min: 2,
            max: 40
        }
    }
    
	self.setupDeps = function() {
	    // UI dependencies
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
				self.prevPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
			case inputEvents.leave:
				break;
			case inputEvents.move:
				if(self.canvas.mouse) {
					var data = {
						start: self.prevPos,
						end: { x: e.pageX, y: e.pageY },
						name: self.name,
						config: { 
							width: self.settings.width.val,
							color: self.canvas.fgColor
						}
					};
					self.prevPos = data.end;
					self.canvas.sendData(data);
				}
				else {
				    var data = {
						start: { x: e.pageX-(self.settings.width.val*0.5), y: e.pageY-(self.settings.width.val*0.5) },
						end: { x: e.pageX + (self.settings.width.val*0.5), y: e.pageY + (self.settings.width.val*0.5) },
						name: "circle",
						config: { 
							width: 2,
							fgcolor: self.canvas.fgColor,
							fill: false,
							samecolor: true,
							type: "startCorner"
						}
					};
					self.canvas.drawOverlay(data);
				}
				break;
		}
	}
    
	self.draw = function(data, ctx) {
	    // Draw regular
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.moveTo(data.start.x, data.start.y);
		ctx.lineTo(data.end.x, data.end.y);
		ctx.lineWidth = data.config.width;
		ctx.strokeStyle = data.config.color;
		ctx.stroke();
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new Pencil();
tools[tool.name] = tool;

console.log("PENCIL LOADED");
