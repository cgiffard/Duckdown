// Duckdown Parser

// Functional Requirements:
//	Works as a codemirror syntax highlighting grammar.
//	Intended to work in IE8+ and shouldn't require ES5
//	Can compile to HTML on the client or in node
//	Should have a comprehensive test suite for every language feature


(function(glob) {
	
	var Grammar = require("./grammar.js");
	
	// Parser State Constants
	var PARSER_STATE_UNINITIALISED = 0;
	
	var Duckdown = function Duckdown(options) {
		this.options		= options;
		
		// Initialise/clear parser state
		this.clear();
	};
	
	// Clears the parser state, duck
	Duckdown.prototype.clear = function() {
		this.characterIndex	= 0;
		this.parserStates	= [];
		this.parserAST		= [];
		this.tokenBuffer	= "";
		this.tokens			= [];
	};
	
	// Append additional tokens to the parser token stack,
	// prior to parsing (and) compilation.
	
	Duckdown.prototype.tokenise = function(input) {
		
		// Get length of incoming chunk...
		var chunkLength = !!input && !!input.length ? input.length : 0;
		
		if (typeof input !== "string") input = String(input);
		
		for (var charIndex = 0; charIndex < chunkLength; charIndex ++) {
			if (input.charAt(charIndex).match(Grammar.wordCharacters)) {
				this.tokenBuffer += input.charAt(charIndex);
				
			} else if (this.tokenBuffer.length) {
				this.tokens.push(this.tokenBuffer);
				this.tokenBuffer = "";
			}
			
			this.characterIndex = charIndex;
		}
		
		return this.tokens;
	};
	
	Duckdown.prototype.parse = function(input) {
		var tokens = this.tokenise(input);
		
		return tokens.slice(1) || this.parserAST;
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