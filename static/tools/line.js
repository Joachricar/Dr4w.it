function LineTool() {
	var self = this;
	
	self.name = "line";
	self.description = "Line tool";
	self.icon = "/images/icons/lineTool.png";

    self.settings = {
        'width': {
            type: types.range,
            name: 'line-width',
            text: 'Line width',
            val: 2,
            min: 2,
            max: 40
        },
        'linecap': {
            type: types.option,
            name: 'line-cap-type',
            text: 'Cap type',
            options: [
                {name:'butt', text:'Butt'},
                {name:'round', text:'Rounded'},
                {name:'square', text:'Square'} 
            ],
            val: 'round'
        }
    };

	self.setupDeps = function() {
        
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
				self.endPos = { x: e.pageX, y:e.pageY };

				var data = {
					start: self.startPos,
					end: self.endPos,
					name: self.name,
					config: { 
						width: self.settings.width.val,
						color: self.canvas.fgColor,
						cap: self.settings.linecap.val
					}
				};
				self.prevPos = data.end;
				self.canvas.sendData(data);
				break;
		}
	}

	self.draw = function(data) {
	    self.canvas.ctx.lineCap = data.config.cap;
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
