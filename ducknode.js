// Duckdown Node Class for AST
/*globals require:true module:true define:true console:true */

(function(glob) {
	
	// Import our grammar
	var Grammar = require("./grammar.js");
	
	var DuckdownNode = function(state) {
		this.state				= state && typeof state === "string" ? state : "NODE_TEXT";
		this.stateStack			= [];
		this.depth				= 0;
		this.children			= [];
		this.parent				= null;
		this.wrapper			= true;
		this.token				= "";
		this.exitToken			= "";
		this.textCache			= "";
		this.rawCache			= "";
		this.previousSibling	= null;
		this.semanticLevel		= "text";
		
		// Is this node mismatched?
		this.mismatched			= false;
	};
	
	// Helper function for escaping input...
	function escape(input) {
		return input.replace(Grammar.escapeCharacters,Grammar.replacer);
	}
	
	// Returns the unformatted text of the node (including all descendants.)
	DuckdownNode.prototype.text = function() {
		var returnBuffer = "";
		
		if (!!this.textCache.length) return this.textCache;
		
		for (var childIndex = 0; childIndex < this.children.length; childIndex ++) {
			if (this.children[childIndex] instanceof DuckdownNode) {
				returnBuffer += this.children[childIndex].text();
				
			} else if (	typeof this.children[childIndex] === "string" ||
						typeof this.children[childIndex] === "number") {
				
				// Ensure basic XML/HTML compliance/escaping...
				var childText = escape(String(this.children[childIndex]));
				
				returnBuffer += childText;
				
			} else {
				
				throw new Error("Unable to coerce unsupported type to string!");
				
			}
		}
		
		this.textCache = returnBuffer;
		
		return this.textCache;
	};
	
	// Returns the raw duckdown used to generate the node (including all descendants.)
	DuckdownNode.prototype.raw = function(escaped) {
		var returnBuffer = "";
		
		if (!!this.rawCache.length) return escaped ? escape(this.rawCache) : this.rawCache;
		
		returnBuffer += this.token;
		
		for (var childIndex = 0; childIndex < this.children.length; childIndex ++) {
			if (this.children[childIndex] instanceof DuckdownNode) {
				returnBuffer += this.children[childIndex].raw();
				
			} else if (	typeof this.children[childIndex] === "string" ||
						typeof this.children[childIndex] === "number") {
				
				returnBuffer += String(this.children[childIndex]);
				
			} else {
				
				throw new Error("Unable to coerce unsupported type to string!");
				
			}
		}
		
		returnBuffer += this.exitToken;
		
		// Cache the raw data for later...
		this.rawCache = returnBuffer;
		
		return escaped ? escape(this.rawCache) : this.rawCache;
	};
	
	DuckdownNode.prototype.toString = function() {
		return "<" + this.state + ":" + this.children.length + ">";
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