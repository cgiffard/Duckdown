// Duckdown Node Class for AST
/*globals require:true module:true define:true console:true */

(function(glob) {
	
	var DuckdownNode = function() {};
	
	
	// Now work out how to export it properly...
	if (typeof module != "undefined" && module.exports) {
		module.exports = DuckdownNode;
		
	} else if (typeof define != "undefined") {
		define("DuckdownNode", [], function() { return DuckdownNode; });
		
	} else {
		glob.DuckdownNode = DuckdownNode;
	}
})(this);