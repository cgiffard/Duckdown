// Little wrapper for handling require();

function require(input) {
	return window[({
		"./ducknode.js":	"DuckdownNode",
		"./index.js":		"Duckdown",
		"./grammar.js":		"DuckdownGrammar"
	})[input]];
}
