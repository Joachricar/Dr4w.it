function RectTool() {
	var self = this;
	
	self.width = 2;
	self.name = "recttool";
	self.description = "Rect tool";
	self.icon = "/images/icons/rectTool.png";
	self.mouse = false;	
	self.prevPos = null;

	self.sameColor = true;
	self.fill = true;

	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		
		$("<span>").attr('id', 'rectWidthView').text( self.width )
            .appendTo($("<p>").text("Stroke width: ").appendTo(div));
       
		$("<div>").slider({
            range: "max",
            value: self.width,
            min: 2,
            max: 40,
            slide: function( event, ui ) {
                self.width = ui.value;
                $("#rectWidthView").text(ui.value);
            }
        }).attr('id', 'rectWidthSlider')
        .addClass('toolSlider')
        .appendTo(div);
		
		$("<br/>").appendTo(div);
		$("<input type='checkbox' name='rect-fill' id='rect-fill' " + (self.fill?"checked='checked'":"") + ">")
			.change(function() {
			self.fill = $(this).is(":checked");
		    $("#rect-sameColor").attr('disabled', !self.fill);
		}).appendTo(div);
		$("<label>").attr("for", 'rect-fill').text('Fill').appendTo(div);
		$("<br/>").appendTo(div);

		$("<input type='checkbox' name='rect-sameColor' id='rect-sameColor' " + (self.sameColor?"checked='checked'":"") + ">")
			.change(function() {
			self.sameColor = $(this).is(":checked");
		}).appendTo(div);
		
		$("<label>").attr("for", "rect-sameColor").text("Fill foreground").appendTo(div);
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
		self.canvas.ctx.fillStyle = (data.config.samecolor?data.config.fgcolor:data.config.bgcolor);
		self.canvas.ctx.rect(data.start.x,data.start.y,data.end.x-data.start.x,data.end.y-data.start.y);
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

var tool = new RectTool();
tools[tool.name] = tool;

console.log("RECT TOOL LOADED");
