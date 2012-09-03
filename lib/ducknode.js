// Duckdown Node Class for AST
// !export:DuckdownNode
/*globals require:true module:true define:true console:true */

// Import our grammar
var Grammar = require("./grammar.js");

var DuckdownNode = function(state) {
	state = state && typeof state === "string" ? state : "NODE_TEXT";
	
	// Node index (as child of the parent)
	this.index				= 0;
	
	this.state				= state;
	this.stateStack			= [];
	this.depth				= 0;
	this.children			= [];
	this.parent				= null;
	this.wrapper			= true;
	this.token				= "";
	this.exitToken			= "";
	this.previousSibling	= null;
	this.nextSibling		= null;
	this.semanticLevel		= "text";
	
	// Link back to the duckdown parser
	this.parser				= null;
	
	// Track whether this node has been processed before compilation...
	this.processed			= false;
	
	// Does this node contain block children? If so - what kind of block?
	this.blockParent		= false;
	this.blockType			= null;
	
	// Was our /real/ previous sibling culled on close?
	// (This doesn't preclude us from having a .previousSibling - but
	// in that case it simply refers to the previousSibling /after/ culling.)
	this.prevSiblingCulled = false;
	this.prevCulledSiblingState = null;
	
	// Same goes for next-sibling...
	this.nextSiblingCulled = false;
	this.nextCulledSiblingState = null;
	
	// Caching for quickly returning text, etc.
	this.textCache = "";
	this.rawCache = "";
	
	// Is this node mismatched?
	this.mismatched = false;
};

// Helper function for escaping input...
function escape(input) {
	return input.replace(Grammar.escapeCharacters,Grammar.replacer);
}

// Helper function for updating the indices of child elements...
function updateIndicies(nodeList) {
	for (var childIndex = 0; childIndex < nodeList.length; childIndex++) {
		if (nodeList[childIndex] instanceof DuckdownNode) {
			nodeList[childIndex].index = childIndex;
		}
	}
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

// Returns the raw duckdown used to generate the node
// (including all descendants.)
DuckdownNode.prototype.raw = function(escaped) {
	var returnBuffer = "";
	
	if (!!this.rawCache.length)
		return escaped ? escape(this.rawCache) : this.rawCache;
	
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
	
	if (!Grammar.tokenMappings[this.token].swallowWhitespace)
		returnBuffer += this.exitToken;
	
	// Cache the raw data for later...
	this.rawCache = returnBuffer;
	
	return escaped ? escape(this.rawCache) : this.rawCache;
};

DuckdownNode.prototype.remove = function() {
	var comparisonNode = this,
		tree = (this.parent ? this.parent.children : this.parser.parserAST),
		filterTree =
			tree.filter(function(child) {
				return child !== comparisonNode;
			});
	
	// Update node indices
	updateIndicies(filterTree);
	
	if (this.previousSibling)
		this.previousSibling.nextSibling = this.nextSibling;
	
	if (this.nextSibling)
		this.nextSibling.previousSibling = this.previousSibling;
	
	if (this.parent) {
		this.parent.children = filterTree;
	} else {
		this.parser.parserAST = filterTree;
	}
};

DuckdownNode.prototype.removeChild = function(atIndex) {
	// Before starting, ensure our index will be correct...
	this.updateIndices();
	
	if (!this.children[atIndex])
		throw new Error("Child at index " + atIndex + " does not exist.");
	
	if (this.children[atIndex] instanceof DuckdownNode) {
		this.children[atIndex].remove();
	} else {
		
		// Correct sibling relationships...
		if (atIndex < this.children.length &&
			this.children[atIndex+1] instanceof DuckdownNode)
			this.children[atIndex+1].previousSibling =
				this.children[atIndex-1] || null;
		
		if (atIndex > 0 && this.children[atIndex-1] instanceof DuckdownNode)
			this.children[atIndex-1].nextSibling =
				this.children[atIndex+1] || null;
		
		// Remove item in question
		this.children.splice(atIndex,1);
		
		// Fix indices
		this.updateIndices();
	}
};

DuckdownNode.prototype.updateIndices = function() {
	updateIndicies(this.children);
};

DuckdownNode.prototype.toString = function() {
	return "<" + this.state + ":" + this.children.length + ">";
};

if (module) module.exports = DuckdownNode;