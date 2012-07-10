// Duckdown Parser

// Functional Requirements:
//	Functionall as a codemirror syntax highlighting grammar.
//	Intended to work in IE8+ and shouldn't require ES5
//	Can compile to HTML on the client or in node
//	Should have a comprehensive test suite for every language feature


(function(glob) {
	
	var grammar = require("grammar.js");
	
	// Parser State
	
	
	
	
	
	var Duckdown = function Duckdown(options) {
		this.options = options;
		this.characterIndex = 0;
		this.parserState = null;
	};
	
	Duckdown.prototype.parse = function(input) {
		
	};
	
	Duckdown.prototype.compile = function() {
		
	};
	
	Duckdown.prototype.parseToken = function(state, input) {
		
	};
	
	
	if (typeof module != "undefined" && module.exports) {
		module.exports = Duckdown;
		
	} else if (typeof define != "undefined") {
		define("Duckdown", [], function() { return Duckdown; });
		
	} else {
		glob.Duckdown = Duckdown;
	}
})(this);