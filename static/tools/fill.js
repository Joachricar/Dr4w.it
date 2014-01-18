// Tool template

function FillTool() {
	var self = this;
	
	self.name = "filltool";
	self.description = "Fill stuff";
	self.icon = "/images/icons/bucketTool.png";
    self.message = 'Might be incredibly slow. Works best in chrome';
    
    self.settings = {
        'treshold': {
            type: types.range,
            name: 'fill-treshold',
            text: 'Treshold',
            val: 10,
            min: 1,
            max: 255
        }
    };
    
	self.setupDeps = function() {

	};

	// name: "move", "up", "down", "enter", "leave"
	self.inputEvent = function(name, e) {
		switch(name) {
		    case "down":
		        var data = {
		            pos: { x: e.pageX, y: e.pageY },
		            color: self.canvas.fgColor,
		            name: self.name,
		            treshold: self.settings.treshold.val
		        };
		        self.canvas.sendData(data);
		        break;
		}
	};

	// draw stuff
	self.draw = function(data) {
	    var origColor = self.canvas.ctx.getImageData(data.pos.x, data.pos.y, 1, 1).data;
        var replColorH = cutHex(data.color);
        var replColor = new Array(
            hexToR(replColorH),
            hexToG(replColorH),
            hexToB(replColorH),
            255
        );
        self.otherTreshold = data.treshold;
	    self.fillColor(data.pos, origColor, replColor, data.color);
	    self.otherTreshold = null;
	};
	
	self.fillColor = function(node, origColor, replColor, rgbReplColor) {
	    var q = [];
	    q.push(node);
	    var i4 = 0;
	    var lineimg, lineimgn, lineimgs;
	    var width = self.canvas.ctx.canvas.width;
	    var height = self.canvas.ctx.canvas.height;
	    while(q.length > 0) {
	        var n = q.shift();
	        var w = n.x;
	        var e = n.x;
	        var ce, cw;
	        
	        if(n.y < 0 || n.y > height)
	            continue;
	        
	        lineimg = self.canvas.ctx.getImageData(0, n.y, width, 1).data;
	        if(self.cmpColor(replColor, lineimg, n.x*4))
	            continue;
	        
	        lineimgn = self.canvas.ctx.getImageData(0, n.y+1, width, 1).data;
	        lineimgs = self.canvas.ctx.getImageData(0, n.y-1, width, 1).data;
	        
	        while(w-- > 0)
	            if(!self.cmpColor(origColor, lineimg, w*4))
	                break;
	        
	        while(e++ < width)
	            if(!self.cmpColor(origColor, lineimg, e*4))
	                break;
	       
	        var idata = self.canvas.ctx.createImageData(Math.abs(e-w), 1);
	        self.createLine(idata.data, Math.abs(e-w), replColor);
	        self.canvas.ctx.putImageData(idata, w, n.y);
	        
	        //console.log("e");
	        var now = false;
	        var nos = false;
	        
	        for(var i = w; i < e+2; i++) {
	            i4 = i*4;
	            if(self.cmpColor(origColor, lineimgs, i4)) {
	                if(!nos) {
	                    q.push({x:i, y:n.y-1});
	                    nos = true;
	                }
	            }else {
	                nos = false;
	            }
	        }
	        
	        for(var i = w; i < e+2; i++) {
	            i4 = i*4;
	            if(self.cmpColor(origColor, lineimgn, i4)) {
	                if(!now) {
	                    q.push({x:i, y:n.y+1});
	                    now = true;
	                }
	            } else {
	                now = false;
	            }
	        } 
	    };
	};
	
	self.createLine = function(arr, len, color) {
	    for(var i = 0; i < len; i++)
	        for(var j = 0; j < 4; j++)
	            arr[(i*4)+j] = color[j];
	};
	
	self.cmpColor = function(c1, c2, o) {
	    //console.dir(c1);
	    //console.dir(c2);
	    //console.log(c1[0] + " " + c2[0] + " " + c1[1] + " " + c2[1] + " " + c1[2] + " " + c2[2]);
	    return Math.abs(c1[0] - c2[o+0]) < self.otherTreshold && 
	           Math.abs(c1[1] - c2[o+1]) < self.otherTreshold && 
	           Math.abs(c1[2] - c2[o+2]) < self.otherTreshold && 
	           Math.abs(c1[3] - c2[o+3]) < self.otherTreshold;
	};

	// set which canvas to draw to
	self.setCanvas = function(c) {
		self.canvas = c;
	};
}

// temp variable
// this is used when the tool is loaded
// do not edit name
var tool = new FillTool();

// add to tool-list
tools[tool.name] = tool;
console.log("FILL TOOL LOADED");
