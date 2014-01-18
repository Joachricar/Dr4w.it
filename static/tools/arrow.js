
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
        },
        'linecap': {
            type: types.option,
            name: 'arrow-line-cap-type',
            text: 'Cap type',
            options: [
                {name:'butt', text:'Butt'},
                {name:'round', text:'Rounded'},
                {name:'square', text:'Square'} 
            ],
            val: 'butt'
        },
        'arrowheadpos': {
            type: types.option,
            name: 'arrowhead-pos',
            text: 'Head position',
            options: [
                {name:'front', text:'End'},
                {name:'back', text:'Start'},
                {name:'both', text:'Both'} 
            ],
            val: 'front'
        }
    };
    
	self.setupDeps = function() { };
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
				self.startPos = { x: e.pageX, y: e.pageY };
				break;
			case inputEvents.up:
				self.endPos = { x: e.pageX, y:e.pageY };
				self.canvas.sendData(self.generateData(e));
				break;
		    case inputEvents.move:
		        if(self.canvas.mouse)
		            self.canvas.drawOverlay(self.generateData(e));
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
				color: self.canvas.fgColor,
				headLength: self.settings.headLength.val,
				headWidth: self.settings.headWidth.val,
				fill: self.settings.arrowHeadFill.val,
				join: self.settings.linejoin.val,
				cap: self.settings.linecap.val,
				arrowheadpos: self.settings.arrowheadpos.val
			}
		};
    };
    
    self.drawOverlay = function(data, ctx) {
        self.draw(data, ctx);
    };
    
	self.draw = function(data, ctx) {
	
	    ctx.lineCap = data.config.cap;
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
        if(data.config.arrowheadpos == "front" || data.config.arrowheadpos == "both") {
            var back = self.rotateLeft(self.rotateLeft(dir));
            self.drawArrowHead(ctx, back, data.end, data.config.headLength, data.config.headWidth, data.config.fill);
        }
        if(data.config.arrowheadpos == "back" || data.config.arrowheadpos == "both") {
            self.drawArrowHead(ctx, dir, data.start, data.config.headLength, data.config.headWidth, data.config.fill);
        }
	};
	
	self.drawArrowHead = function(ctx, dir, point, hlen, hwid, fill) {
	    var backPoint = { x: point.x + (dir.x*hlen), y: point.y + (dir.y*hwid)};
	    var up, arrowUpEnd, arrowDownEnd; 
	    up = self.rotateRight(dir);
	    
        arrowUpEnd = { x: backPoint.x + (up.x*(hwid/2.0)), y: backPoint.y + (up.y*(hwid/2.0))};
        ctx.moveTo(arrowUpEnd.x, arrowUpEnd.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        
        up = self.rotateLeft(dir);
        arrowDownEnd = { x: backPoint.x + (up.x*(hwid/2.0)), y: backPoint.y + (up.y*(hwid/2.0))};
        ctx.lineTo(arrowDownEnd.x, arrowDownEnd.y);
        ctx.stroke();
        
        if(fill) {
            ctx.lineTo(arrowUpEnd.x, arrowUpEnd.y);
            ctx.stroke();
            
            ctx.lineTo(point.x, point.y);
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
