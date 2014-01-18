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
    
	self.setupDeps = function() { };
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
			    var data = self.generateData(e);
				self.endPos = data.end;
				self.canvas.sendData(data);
				break;
		    case inputEvents.move:
		        if(self.canvas.mouse) 
		            self.canvas.drawOverlay(self.generateData(e));
		        break;
		}
	};

    self.generateData = function(e) {
        return {
            start: self.startPos,
            end: { x: e.pageX, y:e.pageY },
            name: self.name,
		    config: { 
			    width: self.settings.width.val,
			    color: self.canvas.fgColor,
			    cap: self.settings.linecap.val
		    }
        };
    };
    
    self.drawOverlay = function(data, ctx) {
        self.draw(data, ctx);
    };
    
	self.draw = function(data, ctx) {
	    ctx.lineCap = data.config.cap;
		ctx.beginPath();
		ctx.moveTo(data.start.x, data.start.y);
		ctx.lineTo(data.end.x, data.end.y);
		ctx.lineWidth = data.config.width;
		ctx.strokeStyle = data.config.color;
		ctx.stroke();
	};

	self.setCanvas = function(c) {
		self.canvas = c;
	};
}

var tool = new LineTool();
tools[tool.name] = tool;

console.log("LINE TOOL LOADED");
