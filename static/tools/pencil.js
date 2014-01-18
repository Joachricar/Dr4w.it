function Pencil() {
	var self = this;
	
	self.width = 2;
	self.name = "pencil";
	self.description = "Just a pencil";
	self.icon = "/images/icons/pencil.png";
	self.mouse = false;	
	self.prevPos = null;
    self.smooth = true;
    
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
				self.mouse = true;
				self.prevPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
			case inputEvents.leave:
				self.mouse = false;
				break;
			case inputEvents.move:
				if(self.mouse) {
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
