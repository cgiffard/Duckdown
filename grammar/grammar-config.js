// Duckdown Grammar Configuration
// !exports:DuckdownGrammarConfig

var DuckdownGrammarConfig = {};

// Word characters
// Used for defining token boundries and splitting tokens from them...
DuckdownGrammarConfig.wordCharacters = /[a-z0-9 ]/ig;

// Characters which should be escaped in text
DuckdownGrammarConfig.escapeCharacters =
	/[^a-z0-9\s\-\_\:\\\/\=\%\~\`\!\@\#\$\*\(\)\+\[\]\{\}\|\;\,\.\?\']/ig;

// Function for encoding special characters in text
// Uses named entities for a few known basic characters, and hex encoding
// for everything else.
DuckdownGrammarConfig.replacer = function(match,location,wholeString) {
	if (match === "&") return "&amp;";
	if (match === "<") return "&lt;";
	if (match === ">") return "&gt;";
	if (match === '"') return "&quot;";
	
	return "&#x" + match.charCodeAt(0).toString(16) + ";";
};

if (module) module.exports = DuckdownGrammarConfig;