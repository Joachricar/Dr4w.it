function RectTool() {
	var self = this;
	
	self.name = "recttool";
	self.description = "Rect tool";
	self.icon = "/images/icons/rectTool.png";

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
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
				self.canvas.sendData(self.generateData(e));
				break;
			case inputEvents.move:
				if(self.canvas.mouse) {
				    self.canvas.drawOverlay(self.generateData(e));
				}
				break;
		}
	};

    self.generateData = function(e) {
        return {
			start: self.startPos,
			end: { x: e.pageX, y: e.pageY },
			name: self.name,
			config: { 
				width: self.settings.width.val,
				bgcolor: self.canvas.bgColor,
				fgcolor: self.canvas.fgColor,
				samecolor: self.settings.sameColor.val,
				fill: self.settings.fill.val
			}
		};
    };
    
    self.drawOverlay = function(data, ctx) {
        self.draw(data, ctx);
    };
    
	self.draw = function(data, ctx) {
		ctx.beginPath();
		ctx.fillStyle = (data.config.samecolor?data.config.fgcolor:data.config.bgcolor);
		ctx.rect(data.start.x,data.start.y,data.end.x-data.start.x,data.end.y-data.start.y);
		if(data.config.fill)
			ctx.fill();
	    
		ctx.strokeStyle = data.config.fgcolor;
		ctx.lineWidth = data.config.width;
		ctx.stroke();
	};

	self.setCanvas = function(c) {
		self.canvas = c;
	};
}

var tool = new RectTool();
tools[tool.name] = tool;

console.log("RECT TOOL LOADED");
