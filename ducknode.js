// Duckdown Node Class for AST
/*globals require:true module:true define:true console:true */

(function(glob) {
	
	var DuckdownNode = function(state) {
		this.state		= state && typeof state === "string" ? state : "NODE_TEXT";
		this.stateStack	= [];
		this.depth		= 0;
		this.children	= [];
		this.parent		= null;
		this.wrapper	= true;
		this.textCache	= "";
	};
	
	DuckdownNode.prototype.text = function() {
		var returnBuffer = "";
		
		if (!!this.textCache.length) return this.textCache;
		
		for (var childIndex = 0; childIndex < this.children.length; childIndex ++) {
			if (this.children[childIndex] instanceof DuckdownNode) {
				returnBuffer += this.children[childIndex].text();
				
			} else if (	typeof this.children[childIndex] === "string" ||
						typeof this.children[childIndex] === "number") {
				
				returnBuffer += this.children[childIndex];
				
			} else {
				
				throw new Error("Unable to coerce unsupported type to string!");
				
			}
		}
		
		this.textCache = returnBuffer;
		
		return this.textCache;
	};
	
	
	// Now work out how to export it properly...
	if (typeof module != "undefined" && module.exports) {
		module.exports = DuckdownNode;
		
	} else if (typeof define != "undefined") {
		define("DuckdownNode", [], function() { return DuckdownNode; });
		
	} else {
		glob.DuckdownNode = DuckdownNode;
	}
})(this);