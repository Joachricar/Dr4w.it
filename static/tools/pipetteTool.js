function PipetteTool() {
	var self = this;
	
	self.name = "pipette";
	self.description = "Pick up color";
	self.icon = "/images/icons/pipetteTool.png";
    
	self.setupDeps = function() {
	};
	
	self.inputEvent = function(name, e) {
		switch(name) {
		    case inputEvents.down:
		        var colorrgb = self.canvas.ctx.getImageData(e.pageX, e.pageY, 1, 1).data;
		        var r = colorrgb[0].toString(16);
		        var g = colorrgb[1].toString(16);
		        var b = colorrgb[2].toString(16);
		        
		        setForeground("#"+r+g+b);
				break;
		}
	};

	self.setCanvas = function(c) {
		self.canvas = c;
	};
}

var tool = new PipetteTool();
tools[tool.name] = tool;

