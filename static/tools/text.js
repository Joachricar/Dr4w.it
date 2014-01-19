function TextTool() {
	var self = this;
	
	self.width = 2;
	self.name = "texttool";
	self.description = "Text";
	self.icon = "/images/icons/textTool.png";
	self.prevPos = null;
    self.cursor = "none";
    
    self.settings = {
        'fontSize': {
            type: types.range,
            text: 'Font size',
            name: 'texttool-font-size',
            val: 16,
            min: 8,
            max: 120
        },
        'font_weight': {
            type: types.option,
            text: 'Font weight',
            name: 'tt-font-weight',
            options: [
                { name: 'normal', text: 'Normal' },
                { name: 'bold', text: 'Bold' },
                { name: 'bolder', text: 'Bolder' },
                { name: 'lighter', text: 'Lighter' }
            ],
            val: 'normal'
        },
        'font_style': {
            type: types.option,
            text: 'Font style',
            name: 'tt-font-style',
            options: [
                { name: 'normal', text: 'Normal' },
                { name: 'italic', text: 'Italic' },
                { name: 'oblique', text: 'Oblique' }
            ],
            val: 'normal'
        },
        'font': {
            type: types.option,
            text: 'Font',
            name: 'tt-font',
            options: [
                { name: 'Arial', text: 'Arial' },
                { name: 'Arial Black', text: 'Arial Black' },
                { name: 'Comic Sans MS', text: 'Comic Sans MS' },
                { name: 'Courier', text: 'Courier' },
                { name: 'Courier New', text: 'Courier New' },
                { name: 'Georgia', text: 'Georgia' },
                { name: 'Monospace', text: 'Monospace' },
                { name: 'Serif', text: 'Serif' },
                { name: 'Times New Roman', text: 'Times New Roman' },
                { name: 'Verdana', text: 'Verdana' },
                { name: 'Ubuntu', text: 'Ubuntu' }
            ],
            val: 'Ubuntu'
        },
        'string': {
            type: types.string,
            text: 'Text',
            name: 'texttool-string',
            val: "",
        }
    }
    
	self.setupDeps = function() {
	    // UI dependencies
	}
	
	self.inputEvent = function(name, e) {
		switch(name) {
			case inputEvents.down:
			    if(self.settings.string.val != "")
				    self.canvas.sendData(self.generateData(e));
				break;
			case inputEvents.move:
			    if(self.settings.string.val != "")
				    self.canvas.drawOverlay(self.generateData(e));
				break;
		}
	};
	
	self.generateData = function(e) {
	    return {
			start: { x: e.pageX , y: e.pageY },
			end: { x: e.pageX , y: e.pageY },
			name: self.name,
			config: { 
				fontSize: self.settings.fontSize.val,
				fgcolor: self.canvas.fgColor,
				text: self.settings.string.val,
				font: self.settings.font.val,
				fontWeight: self.settings.font_weight.val,
				fontStyle: self.settings.font_style.val,
				baseline: "top"
			}
		};
	}
	
    self.drawOverlay = function(data, ctx) {
        self.draw(data, ctx);
    }
    
	self.draw = function(data, ctx) {
        ctx.fillStyle= data.config.fgcolor;
        ctx.font= data.config.fontStyle + " "  + data.config.fontWeight + " " + data.config.fontSize + "px " + data.config.font;
        ctx.textBaseline=data.config.baseline;
        ctx.fillText(data.config.text, data.start.x,data.start.y); 
	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new TextTool();
tools[tool.name] = tool;

console.log("TEXT TOOL LOADED");
