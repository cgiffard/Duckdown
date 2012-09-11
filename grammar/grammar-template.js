// Core state genus object
// Defines the basic structure for grammar components, which can extend it as
// required.
//
// (Termed a 'genus' because multiple Duckdown Nodes can be of this 'genus', and 
// it was catchier and less ambiguous than 'kind'!)
//
// !exports:GrammarGenus

/*
	Public: Core grammar object, to be extended for each grammar construct.

	token			- the token which triggered the grammar genus.
	state			- the state ID for this grammar genus.
	semanticLevel	- a string describing the nesting semantics for the genus.

	Examples

		new GrammarGenus(".","1");

		new GrammarBlockquote(">","BLOCKQUOTE","block");

*/
function GrammarGenus(token,state,semanticLevel) {
	// Define our core identity - our state,
	// tokens we respond to, and our text-level semantics.
	
	this.state				= state || "VOID_ELEMENT";
	this.token				= token || null;
	this.semanticLevel		= semanticLevel || "text";
	
	// ---
	// Now we define some properties for giding matching and other behaviour.
	// What tokens or text might trigger us to close a node of this genus?
	this.exit				= /\n/;
	
	// And once closed, what raw text would be considered valid
	// for a node of this genus?
	this.validIf			= /.*/ig;
	
	// Now we define some basic behavioural defaults.
	// Are we a wrapper element (can we contain other elements, or just text?)
	this.wrapper			= true;
	
	// Do we swallow our exit token?
	// (With the exception of things like line breaks.)
	this.swallowTokens		= true;
	
	// Do we require a blank previous sibling?
	this.blankPrevSibling	= false;
	
	// Or must we be the first child in an element?
	this.mustBeFirstChild	= true;
	
	// And can elements of this genus nest recursively?
	this.allowSelfNesting	= false;
}

/*
	Public: Called when running the tokeniser, to determine initial token
	boundries. Later called when matching tokens to a grammar genus.
	
	If the function returns a truthy value, the token is considered matched.
	
	It is generally expected that this function should be extended, not called,
	as it is likely more useful to Duckdown itself than grammar code.
	
	token		- the token string to be matched.
	priorToken	- the token previous in the buffer to this one.
	
	Examples
	
		GrammarGenus.matchToken(".","1");
		
		GrammarGenus.matchToken("---","\n");
	
	
	Returns a boolean describing whether the token matches the genus.
	
*/

GrammarGenus.prototype.matchToken = function(token,priorToken) {
	// The default is a very simple match.
	return this.token === token;
};

/*
	Public: Called by the parser, and used as an additional hook to give grammar
	functions greater control over whether they're created or not.

	token		- the token string matching this genus.
	state		- the current state of the parser.
	
	Yields
	
		The Duckdown parser object, containing state variables relevant to the
		preprocessing of the node.

	Examples

		GrammarGenus.preprocess(".","LIST_ORDERED");
	

	Returns a boolean describing whether the node should be created. If the
	return value is true, the node is created. If the return value is false,
	the node is ignored, and buffered as text.

*/

GrammarGenus.prototype.preprocess = function(token,state) {
	return true;
};

/*
	Public: Called by the parser upon closing a node - and determines whether a
	node is valid (ie. should remain as a node, be removed from the AST, or be
	converted to text and destroyed.)

	node		- the Duckdown node being processed.

	Yields

		The Duckdown parser object, containing state variables relevant to the
		processing of the node.

	Examples

		GrammarGenus.process(node);


	Returns one of three values: true if the node should be retained, false if
	the node should be destroyed and completely removed from the document, or -1
	if the node should be converted to text and left in the document.

*/

GrammarGenus.prototype.process = function(node) {
	return true;
};

/*
	Public: Called by the parser when compiling a node. This function can
	completely determine what text ends up in the HTML result for a given node
	type.
	
	node		- the Duckdown node being processed.
	compiler	- a reference to the Duckdown recursive compiler, to be used if 
					this node requires its children be compiled.
	
	Yields
	
		The Duckdown parser object, containing state variables relevant to the
		processing of the node.
	
	Examples
	
		GrammarGenus.compile(node,compiler);
	
	
	Returns a string containing the text to be inserted into the Duckdown
	document buffer.

*/

GrammarGenus.prototype.compile = function(node,compiler) {
	return compiler(node);
};

/*
	Public: Enables recursive extension of the Grammar genus class, for building
	up a complete grammar.

	token			- the primary token associated with a grammar genus.
	state			- the state ID associated with a grammar genus.
	semanticLevel	- the text semantic for the genus.
	extension		- an object map of methods intended to extend
						genus template methods.

	Examples

		GrammarGenus.extend(">","BLOCKQUOTE","block",{
			"compile": function(node,compiler) {
				return "<blockquote>" + compiler(node) + "</blockquote>";
			}
		});
	
	
	Returns an extended class representing the new token genus.

*/
GrammarGenus.prototype.extend = function(extension) {
	
	if (typeof extension !== "object")
		throw Error("You must use an object in order to extend the genus.");
	
	var newGrammar = new GrammarGenus(
							extension.token,
							extension.state,
							extension.semanticLevel);
	
	// Save prototype back in;
	//newGrammar.prototype = new GrammarGenus(token,state,semanticLevel);
	
	for (var key in extension) {
		if (extension.hasOwnProperty(key) &&
			key in GrammarGenus.prototype &&
			GrammarGenus.prototype[key] instanceof Function) {
			
			newGrammar[key] = function() {
				var context = cloneObject(this),
					args = [].slice.call(arguments,0);
				
				// Attach super function
				context.super = function() {
					GrammarGenus.prototype[key].apply(context,args);
				};
				
				extension[key].apply(context,args);
			};
		}
	}
	
	return newGrammar;
};

/*
	Private: Little function for flat-cloning an object (to avoid the
	pass-by-ref hell we'd otherwise find ourselves in.)
	
	We retain references to children, (those which aren't primitives) but the
	object is now unique.

	token			- the object to clone.

	Returns a a new object with the properties and methods of the old one.

*/
function cloneObject(source) {
	var destination = {};
	
	for (var key in source) {
		if (source.hasOwnProperty(key)) {
			destination[key] = source;
		}
	}
	
	return destination;
}

if (module) module.exports = GrammarGenus;