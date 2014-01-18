function ClearTool() {
	var self = this;
	
	self.name = "clear";
	self.description = "Clear ze board";
	self.icon = "/images/icons/clearTool.png";
	self.prevPos = null;

	self.setupDeps = function() {
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				var data = {
					name: self.name
				};
				self.canvas.sendData(data);
				break;
		}
	}

	self.draw = function(data) {
		self.canvas.ctx.clearRect(0,0, self.canvas.ctx.canvas.width, self.canvas.ctx.canvas.height);
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new ClearTool();
tools[tool.name] = tool;

console.log("CLEAR TOOL LOADED");
