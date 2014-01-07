function Pencil() {
	var self = this;
	
	self.width = 2;
	self.name = "pencil";
	self.description = "Just a pencil";
	self.icon = "/images/icons/pencil.png";
	
	self.buildMenu = function() {
		var div = $("<div class='tool-settings'>");
		$("<input type='number' id='pencil-width'>" + self.width + "</input>").change(function() {
			self.width = $(this).val();
		}).appendTo(div);
		return div;
	}

	self.inputEvent(name, e) {

	}

	self.draw(data) {

	}

	self.setCanvas = function(c) {
		self.canvas = c;
	}
}

var tool = new Pencil();
tools[tool.name] = tool;

console.log("PENCIL LOADED");
