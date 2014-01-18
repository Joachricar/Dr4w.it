function ArrowTool() {
	var self = this;
	
	self.name = "arrowtool";
	self.description = "Arrow tool";
	self.icon = "/images/icons/arrowTool.png";

    self.settings = {
        'arrowHeadFill': {
            type: types.bool,
            name: 'arrow-head-fill',
            text: 'Fill head',
            val: false
        },
        'headLength': {
            type: types.range,
            name: 'arrow-head-length',
            text: 'Head length',
            val: 20,
            min: 10,
            max: 40
        },
        'headWidth': {
            type: types.range,
            name: 'arrow-head-width',
            text: 'Head width',
            val: 20,
            min: 10,
            max: 40
        },
        'width': {
            type: types.range,
            name: 'arrow-head-line-width',
            text: 'Line width',
            val: 2,
            min: 2,
            max: 40
        },
        'linejoin': {
            type: types.option,
            name: 'arrow-linejoin-type',
            text: 'Edge type',
            options: [
                {name:'bevel', text:'Bevel'},
                {name:'miter', text:'Point'},
                {name:'round', text:'Rounded'} 
            ],
            val: 'miter'
        }
    };
    
	self.setupDeps = function() { }
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case "down":
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case "up":
				self.endPos = { x: e.pageX, y:e.pageY };

				var data = {
					start: self.startPos,
					end: self.endPos,
					name: self.name,
					config: { 
						width: self.settings.width.val,
						color: self.canvas.fgColor,
						headLength: self.headLength.val,
						headWidth: self.settings.headWidth.val,
						fill: self.settings.arrowHeadFill.val,
						join: self.settings.linejoin.val
					}
				};
				self.prevPos = data.end;
				self.canvas.sendData(data);
				break;
		}
	}

	self.draw = function(data) {
	    var ctx = self.canvas.ctx;
	    ctx.lineJoin = data.config.join;
		ctx.beginPath();
		ctx.moveTo(data.start.x, data.start.y);
		ctx.lineTo(data.end.x, data.end.y);
		ctx.lineWidth = data.config.width;
		ctx.strokeStyle = data.config.color;
		ctx.fillStyle = data.config.color;
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
        
        var dir = self.normalize(self.getDirection(data.start, data.end));
        var back = self.rotateLeft(self.rotateLeft(dir));
        var backPoint = { x: data.end.x + (back.x*self.headLength), y: data.end.y + (back.y*self.headLength)};
        var up, arrowUpEnd, arrowDownEnd;
        
        up = self.rotateRight(back);
        arrowUpEnd = { x: backPoint.x + (up.x*(self.headWidth/2.0)), y: backPoint.y + (up.y*(self.headWidth/2.0))};
        ctx.moveTo(arrowUpEnd.x, arrowUpEnd.y);
        ctx.lineTo(data.end.x, data.end.y);
        ctx.stroke();
        
        up = self.rotateLeft(back);
        arrowDownEnd = { x: backPoint.x + (up.x*(self.headWidth/2.0)), y: backPoint.y + (up.y*(self.headWidth/2.0))};
        ctx.lineTo(arrowDownEnd.x, arrowDownEnd.y);
        ctx.stroke();
        
        if(data.config.fill) {
            ctx.lineTo(arrowUpEnd.x, arrowUpEnd.y);
            ctx.stroke();
            
            ctx.lineTo(data.end.x, data.end.y);
            ctx.stroke();
            
            ctx.closePath();
            ctx.fill();
        }
	};

	self.setCanvas = function(c) {
		self.canvas = c;
	};
	
	self.normalize = function(p) {
	    var m = Math.max(Math.abs(p.x), Math.abs(p.y));
	    return { x: p.x/m, y: p.y/m };
	};
	
	self.rotateLeft = function(p) {
	    return { x: -p.y, y: p.x };
	};
	
	self.rotateRight = function(p) {
	    return { x: p.y, y: -p.x };
	};
	
	self.getDirection = function(p1, p2) {
	    var x = p2.x - p1.x;
	    var y = p2.y - p1.y;
	    return { x: x, y: y };
	};
}

var tool = new ArrowTool();
tools[tool.name] = tool;

console.log("ARROWTOOL LOADED");
