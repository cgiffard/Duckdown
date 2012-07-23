// Duckdown Parser

// Functional Requirements:
//	Works as a codemirror syntax highlighting grammar.
//	Intended to work in IE8+ and shouldn't require ES5
//	Can compile to HTML on the client or in node
//	Should have a comprehensive test suite for every language feature

/*globals require:true module:true define:true console:true */

(function(glob) {
	
	"use strict";
	
	var Grammar = require("./grammar.js");
	
	// Tokeniser State Constants
	var TOKENISER_STATE_UNINITIALISED	= 0,
		TOKENISER_STATE_INSIDE_TOKEN	= 1;
	
	// Parser State Constants
	var PARSER_STATE_UNINITIALISED	= 0;
	
	var Duckdown = function Duckdown(options) {
		this.options		= options;
		
		// Initialise/clear parser state
		this.clear();
	};
	
	// Clears (and re-initialises) the parser state
	Duckdown.prototype.clear = function() {
		// Parser state
		this.currentToken	= "";
		this.prevToken		= "";
		this.tokenPosition	= 0;
		this.parserStates	= [];
		this.parserAST		= [];
		
		// Tokeniser state
		this.characterIndex	= 0;
		this.tokeniserState = TOKENISER_STATE_UNINITIALISED;
		this.tokenBuffer	= "";
		this.tokens			= [];
		this.curChar		= "";
		this.prevChar		= "";
		
		this.feathers		= {};
	};
	
	// Append additional tokens to the parser token stack,
	// prior to parsing (and) compilation.
	
	Duckdown.prototype.tokenise = function(input) {
		// Ensure we're dealing with a string
		if (typeof input !== "string") input = String(input);
		
		// Get length of incoming chunk...
		var chunkLength = !!input && !!input.length ? input.length : 0;
		
		// Storage for our previous character...
		this.prevChar = "";
		this.curChar = "";
		
		for (var charIndex = 0; charIndex <= chunkLength; charIndex ++) {
			this.curChar = input.charAt(charIndex);
			
			if ((!this.curChar.match(Grammar.wordCharacters) && this.tokeniserState === TOKENISER_STATE_INSIDE_TOKEN) ||
				(this.curChar.match(Grammar.wordCharacters) && this.tokeniserState === TOKENISER_STATE_UNINITIALISED)) {
				
				this.tokenBuffer += this.curChar;
				
				if (charIndex === chunkLength && this.tokenBuffer.length) {
					this.tokens.push(this.tokenBuffer);
					this.tokenBuffer = "";
				}
				
			} else {
				
				if (this.tokenBuffer.length) {
					this.tokens.push(this.tokenBuffer);
					this.tokenBuffer = "";
				}
				
				this.tokenBuffer += this.curChar;
				this.tokeniserState = [
						TOKENISER_STATE_INSIDE_TOKEN,
						TOKENISER_STATE_UNINITIALISED
					][this.tokeniserState];
			}
			
			this.characterIndex = charIndex;
			this.prevChar = this.curChar;
		}
		console.log(this.tokens);
		return this.tokens;
	};
	
	Duckdown.prototype.parse = function(input) {
		if (input && typeof input === "string") this.tokenise(input);
		
		for (; this.tokenPosition < this.tokens.length; this.tokenPosition ++) {
			this.parseToken(this,null);
		}
		
		return this.parserAST;
	};
	
	Duckdown.prototype.parseToken = function(state, input) {
		if (this instanceof Duckdown) state = this;
		
		if (input && input.length) {
			state.tokens.push(input);
			state.tokenPosition = state.tokens.length-1;
		}
		
		state.currentToken = state.tokens[state.tokenPosition];
		
		console.log("Processing token ",state.currentToken);
		// Search our current state list for exit conditions
		for (var stateIndex = state.parserStates.length - 1; stateIndex >= 0; stateIndex--) {
			var currentState = state.parserStates[stateIndex],
				stateGenus = Grammar.stateList[currentState];
			
			// Check to see we haven't already cached exit condition for reverse lookup
			// If not, loop until we locate it, and cache info.
			if (!stateGenus.exitCondition) {
				for (var token in Grammar.tokenMappings) {
					if (Grammar.tokenMappings.hasOwnProperty(token) &&
						Grammar.tokenMappings[token].state === currentState) {
						
						stateGenus.exitCondition = Grammar.tokenMappings[token].exit;
						stateGenus.tokenGenus = Grammar.tokenMappings[token];
						
						break;
					}
				}
			}
			
			if (stateGenus.exitCondition && stateGenus.exitCondition.exec(state.currentToken)) {
				
				// First of all, process our now-closed token.
				// Are we
				
				
			}
		}
		
		if (Grammar.tokenMappings[this.currentToken]) {
			var tokenGenus = Grammar.tokenMappings[state.currentToken];
			
			if (state.hasParseState(tokenGenus.state)) {
				
			}
			
			// search our current state list for this genus state
			// if the state already exists, consult genus model
			// if model allows nesting, nest
			// if model says close, close.
			
			
			
			console.log("Mapping found for this token.");
			//console.log(tokenGenus);
			
		} else {
			//console.log("No mappings for this token");
		}
	};
	
	Duckdown.prototype.compile = function(format) {
		// compile from duckdown intermediate format to the destinatino text format.
	};
	
	
	
	
	// Compile AST to default format when coercing Duckdown to string...
	Duckdown.prototype.toString = function() {
		return this.compile();
	};
	
	// Feather functions...
	
	Duckdown.prototype.registerFeather = function(name,callback) {
		
		// Ensure a few key conditions are met...
		if (!name.match(/^[a-z0-9]+$/))						throw new Error("Feather names must consist of lowercase letters and numbers only.");
		if (this.feathers[name])							throw new Error("A feather with the specified name already exists.");
		if (!(callback && callback instanceof Function))	throw new Error("You must provide a function for processing the feather output.");
		
		this.feathers[name] = callback;
	};
	
	Duckdown.prototype.unregisterFeather = function(name) {
		if (!this.feathers[name]) throw new Error("Requested feather does not exist.");
		
		delete this.feathers[name];
	};
	
	
	
	
	// Little helper functions
	Duckdown.prototype.hasParseState = function(stateName) {
		for (var stateIndex = 0; stateIndex < this.parserStates.length; stateIndex ++)
			if (this.parserStates[stateIndex] === stateName)
				return true;
		
		return false;
	};
	
	
	
	// Make our API available publicly...
	
	if (typeof module != "undefined" && module.exports) {
		module.exports = Duckdown;
		
	} else if (typeof define != "undefined") {
		define("Duckdown", [], function() { return Duckdown; });
		
	} else {
		glob.Duckdown = Duckdown;
	}
	
})(this);