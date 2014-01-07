function Pencil() {
	var self = this;
	
	self.width = 1;
	self.name = "pencil";
	self.description = "Just a pencil";
	self.icon = "/images/icons/pencil.png";
	self.mouse = false;	
	self.prevPos = null;

	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		$("<input type='number' id='pencil-width' value='" + self.width + "'>").change(function() {
			self.width = $(this).val();
		}).appendTo(div);
		return div;
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				self.mouse = true;
				self.prevPos = { x: e.pageX, y: e.pageY };
				break;
			case "up":
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

var tool = new Pencil();
tools[tool.name] = tool;

console.log("PENCIL LOADED");
