function CircleTool() {
	var self = this;
	
	self.width = 2;
	self.name = "circle";
	self.description = "Circle tool";
	self.icon = "/images/icons/circleTool.png";
	self.mouse = false;	
	self.prevPos = null;

	self.sameColor = true;
	self.fill = true;

	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		$("<input type='text' id='circle-width' value='" + self.width + "'>").change(function() {
			self.width = $(this).val();
		}).appendTo(div);
		
		$("<br/>").appendTo(div);
		$("<input type='checkbox' name='circle-fill' id='circle-fill' " + (self.fill?"checked='checked'":"") + ">")
			.change(function() {
			self.fill = $(this).is(":checked");
		}).appendTo(div);
		$("<label>").attr("for", 'circle-fill').text('Fill').appendTo(div);
		$("<br/>").appendTo(div);

		$("<input type='checkbox' name='circle-sameColor' id='circle-sameColor' " + (self.sameColor?"checked='checked'":"") + ">")
			.change(function() {
			self.sameColor = $(this).is(":checked");
		}).appendTo(div);
		$("<label>").attr("for", "circle-sameColor").text("Same color").appendTo(div);
		return div;
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				self.mouse = true;
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case "up":
				self.mouse = false;
				self.endPos = { x: e.pageX, y:e.pageY };

				var data = {
					start: self.startPos,
					end: self.endPos,
					name: self.name,
					config: { 
						width: self.width,
						bgcolor: self.canvas.bgColor,
						fgcolor: self.canvas.fgColor,
						samecolor: self.sameColor,
						fill: self.fill
					}
				};
				self.prevPos = data.end;
				self.canvas.sendData(data);
				break;
			case "move":
				if(self.mouse) {
				}
				break;
		}
	}

	self.draw = function(data) {
		self.canvas.ctx.beginPath();
		var cx = Math.floor((data.start.x+data.end.x)/2);
		var cy = Math.floor((data.start.y+data.end.y)/2);
		
		self.canvas.ctx.fillStyle = (data.config.samecolor?data.config.fgcolor:data.config.bgcolor);
		self.canvas.ctx.arc(cx, cy, Math.abs(cx-Math.min(data.start.x, data.start.y)), 0, 2*Math.PI, false);
		if(data.config.fill)
			self.canvas.ctx.fill();
		self.canvas.ctx.strokeStyle = data.config.fgcolor;
		self.canvas.ctx.lineWidth = data.config.width;
		self.canvas.ctx.stroke();
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new CircleTool();
tools[tool.name] = tool;

console.log("PENCIL LOADED");
