// Duckdown Grammar Definitions
// This isn't built for the browser.
//
// !exports:DuckdownGrammar
// !nobuild

var DuckdownGrammar = {},
	DuckdownGrammarConfig = require("./grammar-config.js"),
	GrammarGenus = new (require("./grammar-template.js"))(),
	fs = require("fs");

// Copy our Grammar Config over...
for (var key in DuckdownGrammarConfig) {
	if (DuckdownGrammarConfig.hasOwnProperty(key)) {
		DuckdownGrammar[key] = DuckdownGrammarConfig[key];
	}
}

function extendGenus(genus) {
	return GrammarGenus.extend(genus);
}

// Load in our grammar genii/genuses/whatever...
DuckdownGrammar.genus = {};

fs.readdir(__dirname,function(err,dirContent) {
	if (err) throw err;
	
	dirContent.forEach(function(file) {
		if (file.match(/.genus$/i)) {
			var tmpGenus = require("./" + file);
			console.log(tmpGenus);
			console.log(tmpGenus.state);
			DuckdownGrammar.genus[tmpGenus.state] = extendGenus(tmpGenus);
		}
	});
});

//DuckdownGrammar.genus.IMPLICIT_BREAK = require("./implicit-break.genus");
//DuckdownGrammar.genus.IMPLICIT_INDENT = require("./implicit-indent.genus");

if (module) module.exports = DuckdownGrammar;