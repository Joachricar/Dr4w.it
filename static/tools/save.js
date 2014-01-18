function SaveTool() {
	var self = this;
	
	self.width = 2;
	self.name = "savetool";
	self.description = "Save image";
	self.icon = "/images/icons/saveTool.png";
	self.mouse = false;	
	self.prevPos = null;
    self.smooth = true;
    
	self.setupDeps = function() {
	};
	
	self.inputEvent = function(name, e) {
	    
		switch(name) {
		    case inputEvents.selected:
		        // here is the most important part because if you dont replace you will get a DOM 18 exception.
		        var image = self.canvas.ctx.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		        alert(image);
                window.location.href = image; // it will save locally
				break;
		}
	};

	self.draw = function(data) {
	};

	self.setCanvas = function(c) {
		self.canvas = c;
	};
}

var tool = new SaveTool();
tools[tool.name] = tool;
console.log("SAVE TOOL LOADED");

