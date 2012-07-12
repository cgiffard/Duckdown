// Grammar

(function(glob) {
	
	// Set up our grammar object
	var Grammar = {};
	
	// Word characters
	// Used for defining token boundries and splitting tokens from 
	Grammar.wordCharacters = /[a-z0-9 ]/ig;
	
	// Parser states
	// Used for storing all the possible simultaneous states the parser could have
	// These states may describe bold text, nesting depth, special temporary cursor status, etc.
	Grammar.stateList = {
		"TEXT_BOLD": {}
	};
	
	
	// Now work out how to export it properly...
	if (typeof module != "undefined" && module.exports) {
		module.exports = Grammar;
		
	} else if (typeof define != "undefined") {
		define("DuckdownGrammar", [], function() { return Grammar; });
		
	} else {
		glob.DuckdownGrammar = Grammar;
	}
})(this);