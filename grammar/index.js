// Duckdown Grammar Definitions

/*globals require:true module:true define:true console:true */

(function(glob) {

	"use strict";

	// Set up our grammar object
	var Grammar = {};

	// Word characters
	// Used for defining token boundries and splitting tokens from them...
	Grammar.wordCharacters = /[a-z0-9 ]/ig;

	// Characters which should be escaped in text
	Grammar.escapeCharacters =
		/[^a-z0-9\s\-\_\:\\\/\=\%\~\`\!\@\#\$\*\(\)\+\[\]\{\}\|\;\,\.\?\']/ig;

	// Function for encoding special characters in text
	// Uses named entities for a few known basic characters, and hex encoding
	// for everything else.
	Grammar.replacer = function(match,location,wholeString) {
		if (match === "&") return "&amp;";
		if (match === "<") return "&lt;";
		if (match === ">") return "&gt;";
		if (match === '"') return "&quot;";

		return "&#x" + match.charCodeAt(0).toString(16) + ";";
	};
	
	// Load in our grammar genii/genuses/whatever...
	Grammar.genus = {};
	
	Grammar.genus.IMPLICIT_BREAK = require("implicit-break.genus");
	// Grammar.genus.IMPLICIT_BREAK = require("implicit-break.genus");
	
	
	// Now export our grammar properly...
	if (typeof module != "undefined" && module.exports) {
		module.exports = Grammar;

	} else if (typeof define != "undefined") {
		define("DuckdownGrammar", [], function() { return Grammar; });

	} else {
		glob.DuckdownGrammar = Grammar;
	}
})(this);