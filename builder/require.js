// Little wrapper for handling require();

function require(input) {
	return window[({
		"./ducknode.js":	"DuckdownNode",
		"./duckdown.js":	"Duckdown",
		"./grammar.js":		"DuckdownGrammar",
		"../grammar":		"DuckdownGrammar"
	})[input]];
}
