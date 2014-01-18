function RectTool() {
	var self = this;
	
	self.name = "recttool";
	self.description = "Rect tool";
	self.icon = "/images/icons/rectTool.png";
	self.mouse = false;	
	self.prevPos = null;

    self.settings = {
        'fill': {
            type: types.bool,
            name: 'rect-fill',
            text: 'Fill',
            val: false
        },
        'sameColor': {
            type: types.bool,
            name: 'rect-same-color',
            text: 'Fill foreground',
            val: false
        },
        'width': {
            type: types.range,
            name: 'rectStrokeWidth',
            text: 'Stroke width',
            val: 2,
            min: 2,
            max: 40
        }
    };

	self.setupDeps = function() {
		$("#rect-fill").change(function() {
		    $("#rect-same-color").attr('disabled', !$(this).is(":checked"));
        });
        $("#rect-same-color").attr('disabled', !$("#rect-fill").is(":checked"));
	};
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
				self.mouse = true;
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
				self.mouse = false;
				self.endPos = { x: e.pageX, y:e.pageY };

				var data = {
					start: self.startPos,
					end: self.endPos,
					name: self.name,
					config: { 
						width: self.settings.width.val,
						bgcolor: self.canvas.bgColor,
						fgcolor: self.canvas.fgColor,
						samecolor: self.settings.sameColor.val,
						fill: self.settings.fill.val
					}
				};
				self.prevPos = data.end;
				self.canvas.sendData(data);
				break;
			case inputEvents.move:
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
