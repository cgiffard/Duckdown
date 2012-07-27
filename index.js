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
		this.options		= options instanceof Object ? options : {};
		
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
		
		// Predigest some grammar stuff for easy lookup
		this.tokenList = (function(){
			var tokens = [];
			for (var token in Grammar.tokenMappings) {
				if (Grammar.tokenMappings.hasOwnProperty(token)) {
					tokens.push(token);
				}
			}
			
			return tokens;
		})();
		
		// What's the longest token in the grammar?
		this.longestToken =
			this.tokenList
				.sort(function(a,b) {
					return b.length - a.length;
				})
				.slice(0,1)
				.pop()
				.length;
		
	};
	
	// Append additional tokens to the parser token stack,
	// prior to parsing (and) compilation.
	//
	// The scan-ahead design emphasises longer (more specific)
	// token matches over shorter ones.
	// 
	// First we match known significant tokens in the text.
	// Then if we don't find these, we split based on
	// word/non-word characters.
	
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
			
			// Set the scope for how far we're going to scan ahead.
			var scanAhead = this.longestToken;
				scanAhead = scanAhead > chunkLength - charIndex ? chunkLength - charIndex : scanAhead;
			
			// Now loop backwards through our scan-ahead allowance.
			for (; scanAhead > 0; scanAhead--) {
				
				// Extract the current phrase using the scan-ahead allowance.
				var curPhrase = input.substr(charIndex,scanAhead);
				
				// Whoah, we've hit a token!
				if (Grammar.tokenMappings[curPhrase]) {
					
					// If there's anything in the buffer, clear it and push it into the token list
					if (this.tokenBuffer.length) {
						this.tokens.push(this.tokenBuffer);
						this.tokenBuffer = "";
					}
					
					// Push the current token we've discovered
					this.tokens.push(curPhrase);
					
					// Advance scan pointer by the scanahead allowance we had remaining...
					charIndex += scanAhead - 1;
					
					// Break out of scan-ahead loop.
					break;
				
				// OK, we haven't hit a token.
				// If we're already down to one character, then...
				} else if (scanAhead === 1) {
					
					// We're also tokenising based on regions of word and non-word characters.
					// Flip state and buffer accordingly.
					
					// If the parser's current state is appropriate for the current character, just add it to the buffer.
					if ((!this.curChar.match(Grammar.wordCharacters) && this.tokeniserState === TOKENISER_STATE_INSIDE_TOKEN) ||
						(this.curChar.match(Grammar.wordCharacters) && this.tokeniserState === TOKENISER_STATE_UNINITIALISED)) {
					
						this.tokenBuffer += this.curChar;
					
					// Looks like we're not dealing with a state-appropriate character! Time to flip state.
					} else {
						
						// If there are any remaining characters in the buffer
						// from our last state, treat them as a token.
						if (this.tokenBuffer.length) {
							this.tokens.push(this.tokenBuffer);
							this.tokenBuffer = "";
						}
						
						// Buffer the current character.
						this.tokenBuffer += this.curChar;
						
						// Flip the tokeniser state!
						this.tokeniserState = [
								TOKENISER_STATE_INSIDE_TOKEN,
								TOKENISER_STATE_UNINITIALISED
							][this.tokeniserState];
					}
					
				}
				
			}
			
			// Keep track of our indexes and previous character...
			this.characterIndex = charIndex;
			this.prevChar = this.curChar;
		}
		
		// If there's anything left in the token buffer now, add it to the token list.
		// Clear the buffer.
		if (this.tokenBuffer.length) {
			this.tokens.push(this.tokenBuffer);
			this.tokenBuffer = "";
		}
		
		return this.tokens;
	};
	
	Duckdown.prototype.parse = function(input) {
		
		if (input && typeof input === "string") this.tokenise(input);
		
		for (; this.tokenPosition < this.tokens.length; this.tokenPosition ++) {
			this.parseToken(this,null);
		}
		
		if (this.parseBuffer.length) {
			console.log("\n\n\n\n\n\nALERT ALERT ALERT WARNING PARSE BUFFER NOT EMPTY\n\n\n\n\n\nParse buffer at end of parsing process.");
			console.log(this.parseBuffer);
		}
		
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
		
		// Search our current state list for exit conditions
		for (var stateIndex = state.parserStates.length - 1; stateIndex >= 0; stateIndex--) {
			// Get genus information
			currentState = state.parserStates[stateIndex];
			stateGenus = Grammar.stateList[currentState];
			
			// Check to see we haven't already cached exit condition for reverse lookup
			// If not, loop until we locate it, and cache info.
			var tmpTokenGenus = lookupTokenForState(currentState);
			
			if (tmpTokenGenus) {
				stateGenus.exitCondition = tmpTokenGenus.exit;
			}
			
			if (stateGenus.exitCondition && stateGenus.exitCondition.exec(state.currentToken)) {
				
				if (!state.currentNode) {
					console.log("About to die.");
					console.log("Current token was",state.currentToken);
					console.log("Token position was",state.tokenPosition);
					console.log(state);
				}
				
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
				
				// Truncate parser state stack...
				state.parserStates.length = stateIndex;
				
				// Finally, do we swallow any token components that match?
				// Check the state genus and act accordingly. If we destroy the token components, 
				// we just return. Otherwise, allow processing to continue based on the current token.
				
				if (stateGenus.tokenGenus.swallowTokens !== false) {
					state.currentToken = state.currentToken.replace(stateGenus.exitCondition,"");
					
					// After swallowing the exit condition, is there anything left to chew on?
					if (!state.currentToken.length) {
						
						// Nope? Return.
						return;
					}
				}
			}
		}
		
		if (Grammar.tokenMappings[this.currentToken]) {
			// Get genus information
			tokenGenus	= Grammar.tokenMappings[state.currentToken];
			newState	= tokenGenus.state;
			stateGenus	= Grammar.stateList[tokenGenus.state];
			
			// search our current state list for this genus state
			if (state.hasParseState(tokenGenus.state) && !tokenGenus.allowSelfNesting) {
				
				// If we're already subscribed to this state, and aren't allowed to self nest,
				// treat this token as text, and append it to the parse buffer.
				state.parseBuffer.push(state.currentToken);
				
			} else {
				
				// If the current state allows wrapping (ie we can nest something inside it...)
				if (weCanWrap()) {
					
					// Add this token's state to our state stack
					state.addParseState(tokenGenus.state);
					
					// Make a new node that represents this state
					var tmpDuckNode = new DuckdownNode(tokenGenus.state);
					
					// Save in all the relevant information...
					tmpDuckNode.stateStack	= state.parserStates.slice(0);
					tmpDuckNode.depth		= state.nodeDepth;
					tmpDuckNode.parent		= state.currentNode;
					tmpDuckNode.wrapper		= tokenGenus.wrapper;
					
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
	
	// Compile from Duckdown intermediate format to the destination text format.
	Duckdown.prototype.compile = function(input) {
		
		// We're getting input this late in the game?
		// Well, we can deal with it, I guess.
		if (input) this.parse(input);
		
		// Recurse through the AST, and return the result!
		return (function Duckpile(input) {
			
			// Buffer for storing compiled data
			var returnBuffer = "";
			
			// We've gotta make sure we can actually loop through the input...
			if (!(input instanceof Array)) return returnBuffer;
			
			// Loop through input...
			for (var index = 0; index < input.length; index++) {
				var currentNode = input[index];
				
				// If the current node we're dealing with is a DuckdownNode object,
				// we'll need to compile it first.
				if (currentNode instanceof DuckdownNode) {
					
					// We only add this node to the buffer if it has children.
					// It must also have some text, regardless of how deep we need to go to find it.
					if (currentNode.children.length && currentNode.text().length) {
						
						// temporary, to simulate some modicum of parsing.
						returnBuffer += currentNode.text();
					}
				
				// Nope - our current node is a string or number, which we'll just coerce
				// to string and add to the return buffer.
				} else if (	typeof currentNode === "number" ||
							typeof currentNode === "string") {
					
					// Just push this node onto our return buffer
					returnBuffer += currentNode;
					
				}
				
			}
			
			return returnBuffer;
			
		})(this.parserAST);
		
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