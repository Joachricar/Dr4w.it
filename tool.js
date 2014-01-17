// Tool template
function ToolType() {
	var self = this;
	
	// tool attributes
	// 	optional
	self.width = 2;
	//  required(used by drawit)
	self.name = "a unique name";
	self.description = "Crazy tool shit";
	self.icon = "/images/icons/someIconForThisTool.png";
	

	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		$("<input>").attr('type','number').attr('id','tool-width').val(self.width).change(function() {
			self.width = $(this).val();
		}).appendTo(div);
		return div;
	}

	// name: "move", "up", "down", "enter", "leave", "selected"
	self.inputEvent = function(name, e) {
		switch(name) {
		    case "move":
		        break;
		}
	}

	// draw stuff
	self.draw = function(data) {
		self.canvas.ctx.whateverTheCanvasCanDo();
	}

	// set which canvas to draw to
	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

// temp variable
// this is used when the tool is loaded
// do not edit name
var tool = new ToolType();

// add to tool-list
tools[tool.name] = tool;

// opt msg
console.log("TOOLTYPE LOADED");
