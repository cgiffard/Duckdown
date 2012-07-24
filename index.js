// Duckdown Parser

// Functional Requirements:
//	Works as a codemirror syntax highlighting grammar.
//	Intended to work in IE8+ and shouldn't require ES5
//	Can compile to HTML on the client or in node
//	Should have a comprehensive test suite for every language feature

/*globals require:true module:true define:true console:true */

(function(glob) {
	
	"use strict";
	
	var Grammar			= require("./grammar.js"),
		DuckdownNode	= require("./ducknode.js");
	
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
		this.parseBuffer	= [];
		this.currentNode	= null;
		this.nodeDepth		= 0;
		
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
		//// console.log(this.tokens);
		return this.tokens;
	};
	
	Duckdown.prototype.parse = function(input) {
		// console.log(input);
		if (input && typeof input === "string") this.tokenise(input);
		
		for (; this.tokenPosition < this.tokens.length; this.tokenPosition ++) {
			this.parseToken(this,null);
		}
		
		// console.log("Parse buffer at end of parsing process.");
		// console.log(this.parseBuffer);
		
		// console.log(this.parserAST);
		return this.parserAST;
	};
	
	Duckdown.prototype.parseToken = function(state, input) {
		var currentState, newState, tokenGenus, stateGenus;
		
		if (this instanceof Duckdown) state = this;
		
		if (input && input.length) {
			state.tokens.push(input);
			state.tokenPosition = state.tokens.length-1;
		}
		
		state.currentToken = state.tokens[state.tokenPosition];
		
		// Helper function to determine whether wrapping is permitted...
		function weCanWrap() {
			// If there's no current states in the stack, we're permitted to wrap. Just do it.
			if (!state.parserStates.length) return true;
			
			// Only look at the most recent state (last on the stack.)
			// If earlier states prevented wrapping, newer states would not have been added.
			var tmpState = state.parserStates[state.parserStates.length-1];
			
			// Find the token info...
			var tokenInfo = lookupTokenForState(tmpState);
			
			// We found the token! Return its specific wrapper info.
			if (tokenInfo) return tokenInfo.wrapper;
			
			// We couldn't find the wrapping information. Default to false.
			return false;
		}
		
		// Helper function to do a reverse-lookup to find token info from a state name.
		// This function caches the lookup against the state object.
		function lookupTokenForState(stateName) {
			// If the state we've been requested to locate the token for doesn't even exist,
			// we've got no choice but to bail out.
			if (!Grammar.stateList[stateName]) return false;
			
			// If we've already cached the link, return that instead.
			if (!!Grammar.stateList[stateName].tokenGenus) return Grammar.stateList[stateName].tokenGenus;
			
			// Uncached? Commence a manual lookup.
			for (var token in Grammar.tokenMappings) {
				if (Grammar.tokenMappings.hasOwnProperty(token) &&
					Grammar.tokenMappings[token].state === currentState) {
					
					// Cache our discovery...
					Grammar.stateList[stateName].tokenGenus = Grammar.tokenMappings[token];
					
					// We found it. Return.
					return Grammar.tokenMappings[token];
				}
			}
			
			// We couldn't locate the token. Whoops.
			return false;
		}
		
		// console.log(i(state.nodeDepth)+"Processing token ",state.currentToken);
		// Search our current state list for exit conditions
		for (var stateIndex = state.parserStates.length - 1; stateIndex >= 0; stateIndex--) {
			// Get genus information
			currentState = state.parserStates[stateIndex];
			stateGenus = Grammar.stateList[currentState];
			
			// Check to see we haven't already cached exit condition for reverse lookup
			// If not, loop until we locate it, and cache info.
			if (!stateGenus.exitCondition) {
				var tmpTokenGenus = lookupTokenForState(currentState);
				
				if (tmpTokenGenus) {
					stateGenus.exitCondition = tmpTokenGenus.exit;
				}
			}
			
			if (stateGenus.exitCondition && stateGenus.exitCondition.exec(state.currentToken)) {
				// console.log(i(state.nodeDepth)+"met exit condition for a current state");
				
				// Add the current parse buffer to its child list.
				state.currentNode.children.push.apply(state.currentNode.children,state.parseBuffer);
				
				// And clear the parse buffer...
				state.parseBuffer = [];
				
				// Does our state genus define a processing function?
				if (stateGenus.process && stateGenus.process instanceof Function) {
					stateGenus.process.call(state,state.currentNode);
				}
				
				// Set our new current node to the parent node of the previously current node
				state.currentNode = state.currentNode.parentNode;
				
				// Decrement node depth
				state.nodeDepth --;
				
				// Finally, do we swallow any token components that match?
				// Check the state genus and act accordingly. If we destroy the token components, 
				// we just return. Otherwise, allow processing to continue based on the current token.
				
				//aaaactually, we remove the exit condition info from the token info.
				if (stateGenus.tokenGenus.swallowTokens !== false) {
					state.currentToken = state.currentToken.replace(stateGenus.exitCondition,"");
				}
			}
		}
		
		if (Grammar.tokenMappings[this.currentToken]) {
			// Get genus information
			tokenGenus	= Grammar.tokenMappings[state.currentToken];
			newState	= tokenGenus.state;
			stateGenus	= Grammar.stateList[tokenGenus.state];
			
			// search our current state list for this genus state
			if (state.hasParseState(tokenGenus.state)) {
				// console.log(i(state.nodeDepth)+"We're already subscribed to this state.");
			} else {
				
				// If the current state allows wrapping (ie we can nest something inside it...)
				if (weCanWrap()) {
					// console.log(i(state.nodeDepth)+"we're not subscribed to this state.");
					
					state.addParseState(tokenGenus.state);
					
					// console.log(i(state.nodeDepth)+"state list now looks like",state.parserStates);
					
					// Make a new node that represents this state
					var tmpDuckNode = new DuckdownNode(tokenGenus.state);
					
					// Save in all the relevant information...
					tmpDuckNode.stateStack	= state.parserStates.slice(0);
					tmpDuckNode.depth		= state.nodeDepth;
					tmpDuckNode.parent		= state.currentNode;
					tmpDuckNode.wrapper		= tokenGenus.wrapper;
					
					// console.log(tmpDuckNode);
					
					// We're not the root element. Flush the current parse-buffer to the node children.
					// Add our new temporary node as a child of the previous current node.
					if (!!state.currentNode) {
						state.currentNode.children.push.apply(state.currentNode.children,state.parseBuffer);
						state.currentNode.children.push(tmpDuckNode);
						
					// We are the root element. Flush the current parse-buffer to the AST root.
					// Add the temporary node as an AST child.
					} else {
						state.parserAST.push.apply(state.parserAST,state.parseBuffer);
						state.parserAST.push(tmpDuckNode);
					}
					
					// Clear parse buffer.
					state.parseBuffer = [];
					
					// Set current node to our temporary node.
					state.currentNode = tmpDuckNode;
					
					state.nodeDepth ++;
					
				// Oh dear, we're not allowed to wrap.
				// What we do instead is add all the subsequent tokens (until the current state has an exit condition met)
				// to the parse buffer. These are saved as node children on state exit.
				} else {
					// console.log(i(state.nodeDepth)+"Oh no. Not allowed to wrap!");
					state.parseBuffer.push(state.currentToken);
				}
			}
		
		// We didn't find any mappings for this token.
		} else {
			
			// Push to parse buffer (if there's anything in the current token at all!)
			if (state.currentToken.length) {
				state.parseBuffer.push(state.currentToken);
			}
		}
	};
	
	Duckdown.prototype.compile = function(format) {
		// compile from duckdown intermediate format to the destination text format.
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
	
	Duckdown.prototype.addParseState = function(stateName) {
		this.parserStates.push(stateName);
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