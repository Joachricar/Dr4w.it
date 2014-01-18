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
	self.message = "OPTIONAL MESSAGE ON TOP OF SETTINGS MENU";
	
	self.settings = {
        'aRangeSetting': {
            type: types.range,
            text: 'Line Width',
            name: 'tool-width',
            val: 2,
            min: 2,
            max: 40
        },
        'aBooleanSetting': {
            type: types.bool,
            name: 'arrow-head-fill',
            text: 'Fill head',
            val: false
        },
        'anOptionSetting': {
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
    }
    
	self.setupDeps = function() {
	    // UI dependencies
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

	

