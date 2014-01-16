// Tool template

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function Queue(){
    this.top = null;
    this.first = null;
    
    this.count = 0;

    this.GetCount = function(){
        return this.count;
    }

    this.Push = function(data){
        var node = {
            data : data,
            next : null
        }

        node.next = this.top;
        this.top = node;

        this.count++;
        
        if(!this.first)
            this.first = node;
    }

    this.Shift = function() {
        var f = this.first;
        this.first = this.first.next;
        this.count--;
        return f;
    }
}

function FillTool() {
	var self = this;
	
	// tool attributes
	// 	optional
	self.width = 2;
	//  required(used by drawit)
	self.name = "filltool";
	self.description = "Fill stuff";
	self.icon = "/images/icons/bucketTool.png";
    self.treshold = 10;
	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		$("<p>").css('color', 'red').text('Might be incredibly slow. Works best in chrome').appendTo(div);
		
		$("<span>").attr('id', 'bucketTresholdView').text( self.treshold )
            .appendTo($("<p>").text("Treshold: ").appendTo(div));
       
		$("<div>").slider({
            range: "max",
            value: self.treshold,
            min: 0,
            max: 255,
            slide: function( event, ui ) {
                self.treshold = ui.value;
                $("#bucketTresholdView").text(ui.value);
            }
        }).attr('id', 'bucketTresholdSlider')
        .addClass('toolSlider')
        .appendTo(div);
        
		return div;
	};

	// name: "move", "up", "down", "enter", "leave"
	self.inputEvent = function(name, e) {
		switch(name) {
		    case "down":
		        var data = {
		            pos: { x: e.pageX, y: e.pageY },
		            color: self.canvas.fgColor,
		            name: self.name,
		            treshold: self.treshold
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
	        
	        /*
	        self.canvas.ctx.beginPath();
	        self.canvas.ctx.moveTo(w, n.y);
	        self.canvas.ctx.lineTo(e, n.y);
	        self.canvas.ctx.lineWidth = 1;
	        self.canvas.ctx.strokeStyle = rgbReplColor;
	        self.canvas.ctx.stroke();
	        */
	        
	        
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

/**
Flood-fill (node, target-color, replacement-color):
 1. Set Q to the empty queue.
 2. If the color of node is not equal to target-color, return.
 3. Add node to Q.
 4. For each element N of Q:
 5.     If the color of N is equal to target-color:
 6.         Set w and e equal to N.
 7.         Move w to the west until the color of the node to the west of w no longer matches target-color.
 8.         Move e to the east until the color of the node to the east of e no longer matches target-color.
 9.         For each node n between w and e:
10.             Set the color of n to replacement-color.
11.             If the color of the node to the north of n is target-color, add that node to Q.
12.             If the color of the node to the south of n is target-color, add that node to Q.
13. Continue looping until Q is exhausted.
14. Return.
*/

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
