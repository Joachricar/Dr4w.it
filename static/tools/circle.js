function CircleTool() {
	var self = this;
	
	self.name = "circle";
	self.description = "Circle tool";
	self.icon = "/images/icons/circleTool.png";
	self.mouse = false;	
	self.prevPos = null;
    self.settings = {
        'fill': {
            type: types.bool,
            name: 'circle-fill',
            text: 'Fill',
            val: true
        },
        'sameColor': {
            type: types.bool,
            name: 'circle-same-color',
            text: 'Fill foreground',
            val: false
        },
        'width': {
            type: types.range,
            name: 'circleStrokeWidth',
            text: 'Stroke width',
            val: 2,
            min: 2,
            max: 40
        }
    };
    
    self.setupDeps = function() {
		$("#circle-fill").change(function() {
		    $("#circle-same-color").attr('disabled', !$(this).is(":checked"));
        });
        $("#circle-same-color").attr('disabled', !$("#circle-fill").is(":checked"));
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
		var cx = Math.floor((data.start.x+data.end.x)/2);
		var cy = Math.floor((data.start.y+data.end.y)/2);
		
		self.canvas.ctx.fillStyle = (data.config.samecolor?data.config.fgcolor:data.config.bgcolor);
		
		var rad = Math.min(Math.abs(cx-data.start.x),Math.abs(cy-data.start.y));
		self.canvas.ctx.arc(cx, cy, rad, 0, 2*Math.PI, false);
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

console.log("CIRCLE TOOL LOADED");
