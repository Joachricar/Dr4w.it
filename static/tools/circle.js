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
        },
        'type': {
            type: types.option,
            name: 'circleType',
            text: 'From',
            options: [
                { name: "startCorner", text: "Start Corner" },
                { name: "start", text: "Start" },
                { name: "center", text: "Center" },
            ],
            val: 'start'
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
        return {
			start: self.startPos,
			end: { x: e.pageX, y: e.pageY },
			name: self.name,
			config: { 
				width: self.settings.width.val,
				bgcolor: self.canvas.bgColor,
				fgcolor: self.canvas.fgColor,
				samecolor: self.settings.sameColor.val,
				fill: self.settings.fill.val,
				type: self.settings.type.val
			}
		};
    };
    
    self.drawOverlay = function(data, ctx) {
        self.draw(data, ctx);
    };
    
	self.draw = function(data, ctx) {
		ctx.beginPath();
		ctx.fillStyle = (data.config.samecolor?data.config.fgcolor:data.config.bgcolor);
		
		var cx, cy, rad;
		if(data.config.type == "center") {
		    cx = data.start.x;
		    cy = data.start.y;
		    
		    var oEnd = {};
		    oEnd.x = Math.abs(data.end.x-data.start.x);
		    oEnd.y = Math.abs(data.end.y-data.start.y);
		    
		    rad = Math.sqrt(Math.pow(oEnd.x, 2) + Math.pow(oEnd.y, 2));
		} else if(data.config.type == "startCorner") {
		    cx = Math.floor((data.start.x+data.end.x)/2);
		    cy = Math.floor((data.start.y+data.end.y)/2);
		    rad = Math.min(Math.abs(cx-data.start.x),Math.abs(cy-data.start.y));
		} else if(data.config.type == "start") {
		    
		    
		    var oEnd = {};
		    oEnd.x = data.end.x-data.start.x;
		    oEnd.y = data.end.y-data.start.y;
		    
		    
		    rad = Math.sqrt(Math.pow(oEnd.x, 2) + Math.pow(oEnd.y, 2))/2;
		    
		    var min = Math.min(oEnd.x, oEnd.y);
		    var norm = {};
		    norm.x = oEnd.x/min;
		    norm.y = oEnd.y/min;
		    cx = data.start.x + (oEnd.x/2);
		    cy = data.start.y + (oEnd.y/2);
		}
		
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
