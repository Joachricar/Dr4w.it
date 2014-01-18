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
            val: false
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
	}
    
    self.generateData = function(e) {
        return data = {
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
		var cx = Math.floor((data.start.x+data.end.x)/2);
		var cy = Math.floor((data.start.y+data.end.y)/2);
		
		ctx.fillStyle = (data.config.samecolor?data.config.fgcolor:data.config.bgcolor);
		
		var rad = Math.min(Math.abs(cx-data.start.x),Math.abs(cy-data.start.y));
		ctx.arc(cx, cy, rad, 0, 2*Math.PI, false);
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

var tool = new CircleTool();
tools[tool.name] = tool;

console.log("CIRCLE TOOL LOADED");
