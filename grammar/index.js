// Duckdown Grammar Definitions
// !exports:DuckdownGrammar

var DuckdownGrammar = {},
	DuckdownGrammarConfig = require("./grammar-config.js");

// Copy our Grammar Config over...
for (var key in DuckdownGrammarConfig) {
	if (DuckdownGrammarConfig.hasOwnProperty(key)) {
		DuckdownGrammar[key] = DuckdownGrammarConfig[key];
	}
}

// Load in our grammar genii/genuses/whatever...
DuckdownGrammar.genus = {};

DuckdownGrammar.genus.IMPLICIT_BREAK = require("./implicit-break.genus");
// Grammar.genus.IMPLICIT_BREAK = require("implicit-break.genus");

if (module) module.exports = DuckdownGrammar;