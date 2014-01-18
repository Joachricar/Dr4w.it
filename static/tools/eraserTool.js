function Eraser() {
	var self = this;
	
	self.name = "eraser";
	self.description = "Just a rectangular eraser";
	self.icon = "/images/icons/eraserTool.png";
	self.mouse = false;	
	self.prevPos = null;
    self.cursor = "none";
    
    self.settings = {
        'width': {
            type: types.range,
            name: 'eraser-width',
            text: 'Size',
            val: 10,
            min: 2,
            max: 60
        }
    };
	self.setupDeps = function() {

	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
				self.mouse = true;
				break;
			case inputEvents.up:
			case inputEvents.leave:
				self.mouse = false;
				break;
			case inputEvents.move:
				if(self.mouse) {
					var data = {
						pos: { x: e.pageX, y: e.pageY },
						name: self.name,
						config: { 
							width: self.settings.width.val,
						}
					};
					self.prevPos = data.end;
					self.canvas.sendData(data);
				}
				var data = {
					start: { x: e.pageX-(self.settings.width.val*0.5), y: e.pageY-(self.settings.width.val*0.5) },
					end: { x: e.pageX + (self.settings.width.val*0.5), y: e.pageY + (self.settings.width.val*0.5) },
					name: "recttool",
					config: { 
						width: 2,
						fgcolor: "#000000",
						fill: false,
						samecolor: true
					}
				};
				self.canvas.drawOverlay(data);
				break;
		}
	}

	self.draw = function(data) {
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
