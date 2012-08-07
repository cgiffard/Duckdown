// duckdown (0.0.1)
// Simple, lightweight Markdown-like language with extensible grammar.
// Christopher Giffard 2012
// 
// 
// Package built Tue Aug 07 2012 16:29:05 GMT+1000 (EST)
// 


(function(glob) {
// Little wrapper for handling require();

function require(input) {
	return window[({
		"./ducknode.js":	"DuckdownNode",
		"./index.js":		"Duckdown",
		"./grammar.js":		"DuckdownGrammar"
	})[input]];
}




// Duckdown Grammar Definitions
/*globals require:true module:true define:true console:true */

(function(glob) {
	
	"use strict";
	
	// Set up our grammar object
	var Grammar = {};
	
	// Word characters
	// Used for defining token boundries and splitting tokens from 
	Grammar.wordCharacters = /[a-z0-9 ]/ig;
	
	// Characters which should be escaped in text
	Grammar.escapeCharacters = /[^a-z0-9\s\-\_\:\\\/\=\%\~\`\!\@\#\$\*\(\)\+\[\]\{\}\|\;\,\.\?\']/ig;
	
	// Function for encoding special characters in text
	// Uses named entities for a few known basic characters, and hex encoding for everything else.
	Grammar.replacer = function(match,location,wholeString) {
		if (match === "&") return "&amp;";
		if (match === "<") return "&lt;";
		if (match === ">") return "&gt;";
		if (match === '"') return "&quot;";
		
		return "&#x" + match.charCodeAt(0).toString(16) + ";";
	};
	
	// Token Mappings
	// Used for defining token boundries for tokenisation and mapping tokens to states.
	//
	Grammar.tokenMappings = {
		"\n": {
			// This node implicitly wraps.
			"wrapper"			: true,
			// Should we swallow tokens for this mapping? Or should they be made available for further processing?
			"swallowTokens"		: false,
			"exit"				: /\n/,
			"state"				: "IMPLICIT_BREAK",
			"semanticLevel"		: "hybrid"
		},
		"\t": {
			// This node implicitly wraps.
			"wrapper"			: true,
			// Should we swallow tokens for this mapping? Or should they be made available for further processing?
			"swallowTokens"		: false,
			"exit"				: /\n/,
			"state"				: "IMPLICIT_INDENT",
			"semanticLevel"		: "hybrid"
		},
		// Four spaces (equivalent to tab above)
		"    ": {
			// This node implicitly wraps.
			"wrapper"			: true,
			// Should we swallow tokens for this mapping? Or should they be made available for further processing?
			"swallowTokens"		: false,
			"exit"				: /\n/,
			"state"				: "IMPLICIT_INDENT",
			"semanticLevel"		: "hybrid"
		},
		// XML/HTML Entity...
		"&": {
			// Determines whether this is a one-off token, or whether it wraps other elements.
			// This defaults to false, for safety.
			"wrapper"			: false,
			// Remove the associated state from the state stack if the following condition is met for the token.
			"exit"				: /([^#a-z0-9]|;)/i,
			// Upon termination of the associated state, we do a check against the entire text from the beginning
			// of the token to the end of the token (including all text inside it.)
			// If this condition matches, we discard the token, and treat it as text.
			"validIf"			: /^&#?[a-z0-9]+;$/ig,
			// Matches this token to a corresponding parser state.
			"state"				: "ENTITY",
			"semanticLevel"		: "text"
		},
		// Emphasis
		"~": {
			// Does this token correspond to text-level or block-level semantics?
			// Seems useful to track this. Remove if unused.
			"semanticLevel"		: "text",
			// This tag does wrap other elements.
			"wrapper"			: true,
			// Multiple levels of emphasis don't make sense.
			// Therefore, we die at the next emphasis tag.
			// allowSelfNesting determines whether a tag can be nested within itself.
			// Defaults to false.
			"allowSelfNesting"	: false,
			"exit"				: /[\~\n]/,
			"validIf"			: /^\~\S[^\n]+\S\~$/,
			"state"				: "TEXT_EMPHASIS"
		},
		// Bold
		"*": {
			"semanticLevel"		: "text",
			"wrapper"			: true,
			"allowSelfNesting"	: false,
			"exit"				: /[\*\n]/,
			// We're bold if there's no space after the asterisk.
			// Otherwise, it's considered a floating asterisk or a bullet.
			"validIf"			: /^\*\S[^\n]+\S\*$/,
			"state"				: "TEXT_STRONG"
		},
		// Struck-through
		"-": {
			"wrapper"			: true,
			"semanticLevel"		: "text",
			"exit"				: /[\-\n]/,
			"validIf"			: /^\-\S[^\n]+\S\-$/,
			"state"				: "TEXT_DEL"
		},
		// Underline
		"_": {
			"wrapper"			: true,
			"semanticLevel"		: "text",
			"exit"				: /[_\n]/,
			"validIf"			: /^\_\S[^\n]+\S\_$/,
			"state"				: "TEXT_UNDERLINE"
		},
		// Feathers
		"<": {
			// Feathers are callouts to other functions. They do not wrap other Duckdown tokens.
			"wrapper"			: false,
			// This could have both text _or_ block level semantics, depending on what the
			// registered feather function returns. It's never a wrapper though.
			"semanticLevel"		: "hybrid",
			"exit"				: /[>\n]/,
			"validIf"			: /^<[a-z][a-z0-9\-\_]*(\s[^>\n]+)*>$/i,
			"state"				: "SPECIAL_FEATHER"
		},
		// Inline code / preformatted text
		"`": {
			"wrapper"			: false,
			"semanticLevel"		: "text",
			"exit"				: /[`\n]/,
			"state"				: "CODE_LITERAL"
		},
		// Headings, 1 - 6
		"h1.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			// "validIf"			: /^h\d\.\s[^\n]+$/ig,
			"state"				: "HEADING_1",
			"semanticLevel"		: "textblock"
		},
		"h2.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			// "validIf"			: /^h\d\.\s[^\n]+$/ig,
			"state"				: "HEADING_2",
			"semanticLevel"		: "textblock"
		},
		"h3.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			// "validIf"			: /^h\d\.\s[^\n]+$/ig,
			"state"				: "HEADING_3",
			"semanticLevel"		: "textblock"
		},
		"h4.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			// "validIf"			: /^h\d\.\s[^\n]+$/ig,
			"state"				: "HEADING_4",
			"semanticLevel"		: "textblock"
		},
		"h5.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			// "validIf"			: /^h\d\.\s[^\n]+$/ig,
			"state"				: "HEADING_5",
			"semanticLevel"		: "textblock"
		},
		"h6.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			// "validIf"			: /^h\d\.\s[^\n]+$/ig,
			"state"				: "HEADING_6",
			"semanticLevel"		: "textblock"
		},
		// Link detection
		"http://": {
			"wrapper"			: false,
			"exit"				: /[^a-z0-9\-_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\%\#\[\]\#]/i,
			"validIf"			: /^http[s]?:\/\/[a-z0-9\-]+(\:\d+)?.*$/i,
			"state"				: "AUTO_LINK",
			// The exit condition matches the first _non_ link character, so we shouldn't swallow it.
			"swallowTokens"		: false,
			"semanticLevel"		: "text"
		},
		"https://": {
			"wrapper"			: false,
			"exit"				: /[^a-z0-9\-_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\%\#\[\]\#]/i,
			"validIf"			: /^http[s]?:\/\/[a-z0-9\-]+(\:\d+)?.*$/i,
			"state"				: "AUTO_LINK",
			// The exit condition matches the first _non_ link character, so we shouldn't swallow it.
			"swallowTokens"		: false,
			"semanticLevel"		: "text"
		},
		"(": {
			"wrapper"			: true,
			"exit"				: /(\s\s+|\n|\))/,
			"validIf"			: /^\([^\n]+\)$/,
			"state"				: "PAREN_DESCRIPTOR",
			// We allow self-nesting because there might be parens in a link description,
			// and we want to remain balanced!
			"allowSelfNesting"	: true,
			"semanticLevel"		: "text"
		}
	};
	
	// Parser states
	// Used for storing all the possible simultaneous states the parser could have
	// These states may describe bold text, nesting depth, special temporary cursor status, etc.
	Grammar.stateList = {
		"ENTITY": {
			"process": function() {
				
			},
			"compile": function(node,compiler) {
				var lastChild = node.children[node.children.length-1];
				
				// if exit token! this is wrong!
				if (node.exitToken === ";") {
					return "&" + node.children.join("") + ";";
				} else if (typeof lastChild === "string" && lastChild.match(/\;/)) {
					return "&" + node.children.join("");
				} else {
					return "&amp;" + compiler(node);
				}
			}
		},
		"IMPLICIT_BREAK": {
			"process": function(node) {
				// If we've got no text content, self destruct!
				if (!node.text().length) return false;
			},
			
			// Compiler...
			"compile": function(node,compiler) {
				
				// Compile children.
				var buffer = compiler(node);
				
				// If node contains a single child with block, textblock, or hybrid semantics...
				// or an implicit_indent object...
				var compileWithWrapper = true;
				
				// This is a flat scan. A deep scan would be silly. (famous last words?)
				for (var childIndex = 0; childIndex < node.children.length; childIndex ++) {
					if (node.children[childIndex] instanceof Object &&
						node.children[childIndex].semanticLevel !== "hybrid" && 
						node.children[childIndex].semanticLevel !== "text") {
						
						compileWithWrapper = false;
						break;
					
					// And we don't compile a wrapper around implicit indents either.
					} else if (node.children[childIndex].state === "IMPLICIT_INDENT") {
						
						compileWithWrapper = false;
						break;
					}
				}
				
				if (compileWithWrapper) {
					return "<p>" + buffer + "</p>\n";
				} else {
					return buffer + "\n";
				}
			}
		},
		"IMPLICIT_INDENT": {
			"process": function(node) {
				// If we've got no text content, self destruct!
				if (!node.text().length) return false;
			},
			
			// Compile conditional on contents...
			"compile": function(node,compiler) {
				
				// if none of our children are lists
				// or blockquotes
				// or anything else funky
				// if we're the direct child of an implicit break
				// or a block or hybrid element (no headings etc.)
				// then we compile as preformatted text.
				// otherwise, just compile our children and return...
				
				var compilePreformatted = false;
				
				// If we don't have a parent element (not sure how that would happen...)
				// If we are the direct child of an implicit break
				// or a block or hybrid element...
				if (!node.parent							||
					node.parent.state === "IMPLICIT_BREAK"	||
					node.parent.semanticLevel === "block"	||
					node.parent.semanticLevel === "hybrid"	) {
					
					var containsBlockChildren = false;
					
					// And if none of our children are block level elements
					// (lists, etc.) then it's probably safe to assume we're just text.
					for (var childIndex = 0; childIndex < node.children.length; childIndex ++) {
						if (node.children[childIndex].semanticLevel === "block" ||
							node.children[childIndex].semanticLevel === "textblock") {
							
							containsBlockChildren = true;
							break;
						}
					}
					
					// If after all that, we didn't find any block children...
					if (!containsBlockChildren) compilePreformatted = true;
				}
				
				if (compilePreformatted) {
					return "<pre>" + node.raw(true).replace(/^\s+/,"") + "</pre>\n";
				} else {
					return compiler(node);
				}
			}
		},
		"TEXT_EMPHASIS": {
			"compile": function(node,compiler) {
				return "<em>" + compiler(node) + "</em>";
			}
		},
		"TEXT_STRONG": {
			"compile": function(node,compiler) {
				return "<strong>" + compiler(node) + "</strong>";
			}
		},
		"TEXT_DEL": {
			"compile": function(node,compiler) {
				return "<del>" + compiler(node) + "</del>";
			}
		},
		"TEXT_UNDERLINE": {
			"compile": function(node,compiler) {
				return "<u>" + compiler(node) + "</u>";
			}
		},
		"CODE_LITERAL": {
			"compile": function(node,compiler) {
				return "<code>" + node.text() + "</code>";
			}
		},
		"HEADING_1": {
			"process": function(node) {
				if (node.previousSibling) return false;
			},
			"compile": function(node,compiler) {
				return "<h1>" + compiler(node) + "</h1>";
			}
		},
		"HEADING_2": {
			"process": function(node) {
				if (node.previousSibling) return false;
			},
			"compile": function(node,compiler) {
				return "<h2>" + compiler(node) + "</h2>";
			}
		},
		"HEADING_3": {
			"process": function(node) {
				if (node.previousSibling) return false;
			},
			"compile": function(node,compiler) {
				return "<h3>" + compiler(node) + "</h3>";
			}
		},
		"HEADING_4": {
			"process": function(node) {
				if (node.previousSibling) return false;
			},
			"compile": function(node,compiler) {
				return "<h4>" + compiler(node) + "</h4>";
			}
		},
		"HEADING_5": {
			"process": function(node) {
				if (node.previousSibling) return false;
			},
			"compile": function(node,compiler) {
				return "<h5>" + compiler(node) + "</h5>";
			}
		},
		"HEADING_6": {
			"process": function(node) {
				if (node.previousSibling) return false;
			},
			"compile": function(node,compiler) {
				return "<h6>" + compiler(node) + "</h6>";
			}
		},
		"AUTO_LINK": {
			"compile": function(node,compiler) {
				
				var linkURL = node.token + node.text(),
					linkText = linkURL;
				
				// If we're in a paren-descriptor, don't compile as a link...
				if (node.parent && node.parent.state === "PAREN_DESCRIPTOR") {
					
					// But only if the paren-decscriptor we're inside is actually a link component...
					if (!!node.parent.link) {
						
						// Then we just return the link text as... text.
						return linkURL;
					}
				}
				
				// If we've previously stored a relationship with a sibling paren descriptor,
				// we've got text for the link. Otherwise, just use the URL as text.
				if (node.linkDetail) {
					linkText = compiler(node.linkDetail);
				}
				
				return "<a href=\"" + linkURL + "\">" + linkText + "</a>";
			}
		},
		"PAREN_DESCRIPTOR": {
			// If we follow AUTO_LINK, we're the text for the link.
			// If not, we just return as parentheses.
			"process": function(node) {
				
				// If this set of parens followed a link, we store the relationship
				// against each, and flag this paren node as being a link component
				if (node.previousSibling && node.previousSibling.state === "AUTO_LINK") {
					
					// Of course, we need to make sure another link hasn't already been attached.
					// (Not sure how that would happen, but it's good to be certain!)
					if (!node.previousSibling.linkDetail) {
						node.previousSibling.linkDetail = node;
						node.link = node.previousSibling;
					}
				}
				
			},
			
			"compile": function(node,compiler) {
				if (!node.link) {
					return "(" + compiler(node) + ")";
				} else {
					return "";
				}
			}
			
		},
		"SPECIAL_FEATHER": {
			
			// Function for processing feathers!
			// Language specific, so not part of parser core.
			// Function is called with the parser object as its context,
			// so 'this' points to the parser object.
			
			"process": function(featherNode) {
				
				// If there's no children, there's nothing to go on. Die.
				if (!featherNode.children.length) return;
				
				// Feathers treat tokens differently.
				// Join and re-split tokens by whitespace...
				var featherTokens = featherNode.children.join("").split(/\s+/ig);
				
				// Now clear children from the node, because we'll replace them soon...
				featherNode.children = [];
				
				// Storage for feather name
				var featherName = featherTokens.shift().replace(/\s+/ig,"");
				
				// Storage for parameters passed to feather function
				var parameterHash = {};
				
				// If we couldn't get a feather name, there's no point continuing.
				if (!featherName.length) return;
				
				// And if the feather name exists and is a function...
				if (this.feathers[featherName] && this.feathers[featherName] instanceof Function) {
					
					// Parse the feather parameters
					var featherState = 0; // Waiting for parameter name
					var parameterName = [],
						parameterValue = [];
					
					for (var tokenIndex = 0; tokenIndex < featherTokens.length; tokenIndex++) {
						var curToken = featherTokens[tokenIndex];
						
						if (featherState === 0) {
							if (!curToken.match(/\:/)) {
								parameterName.push(curToken);
							} else {
								curToken = curToken.split(/[:]+/);
								
								parameterName.push(curToken.shift());
								parameterValue = parameterValue.concat(curToken);
								
								featherState = 1;
							}
						} else {
							if (!curToken.match(/\:/)) {
								parameterValue.push(curToken);
							} else {
								// We've got a split token on our hands. Change state and
								// rewind by one token for re-processing!
								
								featherState = 0;
								tokenIndex --;
								
								// But first, save our current parameter info out and clear buffers!
								parameterHash[parameterName.join(" ")] = parameterValue.join(" ");
								parameterName = [];
								parameterValue = [];
							}
						}
					}
					
					// Clean up amd store final parameter
					if (parameterName.length || parameterValue.length) {
						parameterHash[parameterName.join(" ")] = parameterValue.join(" ");
					}
					
					// Call the feather, get the result!
					var returnedData = this.feathers[featherName](parameterHash);
					
					// Mark as compiled!
					featherNode.compiled = true;
					
					// Replace children with result from feather function
					// ...but only if we received a string, or a number.
					
					if (typeof returnedData === "string" ||
						typeof returnedData === "number") {
						
						featherNode.children = [returnedData];
					}
				}
				
				// Or just return.
				return;
			}
		}
	};
	
	
	// Now work out how to export it properly...
	if (typeof module != "undefined" && module.exports) {
		module.exports = Grammar;
		
	} else if (typeof define != "undefined") {
		define("DuckdownGrammar", [], function() { return Grammar; });
		
	} else {
		glob.DuckdownGrammar = Grammar;
	}
})(this);

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

// Duckdown Parser

// Functional Requirements:
//	Works as a codemirror syntax highlighting grammar.
//	Intended to work in IE8+ and shouldn't require ES5
//	Can compile to HTML on the client or in node
//	Should have a comprehensive test suite involving every language feature
//  Must be able to tokenise, parse, and compile separately
//  Shouldn't be locked to HTML as a compile target (other formats in future!)
//  Ideally, should be able to handle streams, although this isn't a launch requirement.

/*globals require:true module:true define:true console:true window:true process:true */

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
		this.prevNode		= null;
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
		
		this.emit("clear");
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
		
		this.emit("tokenisestart");
		
		// Always start our document with an implicit break...
		if (!this.tokens.length) input = "\n" + input;
		
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
		
		this.emit("tokeniseend");
		
		return this.tokens;
	};
	
	Duckdown.prototype.parse = function(input) {
		
		if (input && typeof input === "string") this.tokenise(input);
		
		// Emit parse-event
		this.emit("parsestart");
		
		for (; this.tokenPosition < this.tokens.length; this.tokenPosition ++) {
			this.parseToken(this,null);
		}
		
		// Emit parse-end event
		this.emit("parseend");
		
		return this.parserAST;
	};
	
	Duckdown.prototype.parseToken = function(state, input) {
		var currentState, newState, tokenGenus, stateGenus, tree;
		
		if (this instanceof Duckdown) state = this;
		
		if (input && input.length) {
			state.tokens.push(input);
			state.tokenPosition = state.tokens.length-1;
		}
		
		state.currentToken = state.tokens[state.tokenPosition];
		
		// Emit parse-token event
		state.emit("parsetoken",state.currentToken);
		
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
		
		// Helper functions to ensure nesting-semantics are correct.
		// Each token genus has a semantic class associated with it. These are:
		// - text
		// - textblock
		// - hybrid
		// - block
		//
		// This concept is very similar to the element semantics in HTML, and defines
		// nesting behaviour:
		//
		// - A block level element is permitted to nest only within other blocks, 
		//   and hybrid elements. It can contain any other element, regardless of text
		//   semantics.
		//
		// - A hybrid element can contain any element, and nest within any element.
		//   It is mainly used for elements where the semantics are indefinite,
		//   such as feathers.
		// 
		// - A textblock can nest within hybrid and block elements, but not text or other
		//   textblock elements. Only text elements can be contained within it.
		//   An example of a textblock element would be a heading.
		//
		// - A text element can nest within any element, but can only contain other
		//   text elements
		//
		// This function returns true or false depending on the nesting compatibility.
		// If no current node is present, and the new node is being inserted directly
		// into the document, this function will return true regardless of text semantics.
		
		function semanticsAreCorrect(newTokenGenus) {
			
			// If we're not nesting within anything, there are no restrictions
			if (!state.currentNode) return true;
			
			// We have no information about the semantics of this element! Just play
			// on the safe side.
			if (!newTokenGenus.semanticLevel) return true;
			
			// If the node we're inserting is a hybrid element, it can go anywhere.
			if (newTokenGenus.semanticLevel === "hybrid") return true;
			
			// Move up through the stack, and find the least permissive semantic in the stack,
			// since that's what will determine whether we can nest.
			var leastPermissiveSemantic = "hybrid";
			
			// A map of the permissiveness of each type.
			var permissiveness = {
				"hybrid": 4,
				"block": 3,
				"textblock": 2,
				"text": 1
			};
			
			for (var stateIndex = 0; stateIndex < state.parserStates.length; stateIndex++) {
				var tokenGenus = lookupTokenForState(state.parserStates[stateIndex]);
				
				if (tokenGenus.semanticLevel &&
					permissiveness[tokenGenus.semanticLevel] < permissiveness[leastPermissiveSemantic]) {
					
					leastPermissiveSemantic = tokenGenus.semanticLevel;
				}
			}
			
			// Simple permissiveness check. With hybrid out of the question, we want
			// to ban any node with a more permissive semantic from nesting inside a node
			// with a less permissive semantic.
			
			if (permissiveness[newTokenGenus.semanticLevel] > permissiveness[leastPermissiveSemantic]) return false;
			
			// And we don't allow textblocks nesting inside other textblocks.
			if (newTokenGenus.semanticLevel === "textblock" && leastPermissiveSemantic === "textblock") return false;
			
			// Otherwise, you're good to go!
			return true;
		}
		
		// Function for closing nodes...
		function closeCurrentNode(currentState,stateGenus,parentNodeClosed) {
			
			// Storage for the return value of a processing function, and match functions
			var returnVal = null, nodeInvalid = false, match, matchPoint = 0, matchLength = 0;
			
			// If we're not just closing this node because the parent node closed...
			if (!parentNodeClosed) {
				// Check where the token matched...
				// (show me where on the doll where the token matched you!)
				match = stateGenus.exitCondition.exec(state.currentToken);
				matchPoint = match.index;
				matchLength = match[0] ? match[0].length : 0;
				
				// If the match point wasn't zero, we'll use it to divide the current token,
				// and push the first part onto the current node's child list
				if (matchPoint > 0) {
					// Push the chunk of the current token (before the match point)
					// onto the parser buffer to be dealt with, just like all the other baby tokens (awww)
					state.parseBuffer.push(state.currentToken.substr(0,matchPoint));
				}
				
				// Save exit-token
				state.currentNode.exitToken = match[0];
			}
			
			// Add the current parse buffer to its child list.
			state.currentNode.children.push.apply(state.currentNode.children,state.parseBuffer);
			
			// If we've got a valid-check for this token genus...
			if (tmpTokenGenus && tmpTokenGenus.validIf instanceof RegExp) {
				
				// Check whether current node is valid against text-match requirement (if applicable)
				if (!tmpTokenGenus.validIf.exec(state.currentNode.raw())) {
					state.emit("nodeinvalid",state.currentNode);
					nodeInvalid = true;
				}
			}
			
			// Does our state genus define a processing function?
			// (don't execute this function if the node has been found to be invalid)
			if (!nodeInvalid && stateGenus.process && stateGenus.process instanceof Function) {
				
				// We save the return value, as we'll need it later...
				returnVal = stateGenus.process.call(state,state.currentNode);
				
				if (returnVal === false) state.emit("nodeselfdestruct",state.currentNode);
			}
			
			// If stateGenus.process returned an explicit false... and now that we've cleaned up...
			// then we assume we're to destroy this node immediately
			// This is useful for, say, culling empty paragraphs, etc.
			if (returnVal === false || nodeInvalid) {
				tree = (state.currentNode.parent ? state.currentNode.parent.children : state.parserAST);
				
				// Simply remove it by truncating the length of the current AST scope
				tree.length --;
				
				// If the node is invalid, plonk the contents of said node back in the current tree,
				// (after removing ourselves from it)
				if (nodeInvalid) {
					tree.push.apply(tree,[state.currentNode.token].concat(state.currentNode.children));
				}
			}
			
			// And clear the parse buffer...
			state.parseBuffer = [];
			
			// Emit the nodeclosed event before we loose the current node pointer...
			state.emit("nodeclosed",state.currentNode);
			
			// Save the pointer to the previous node, if the node isn't being thrown out.
			if (!nodeInvalid && returnVal !== false) state.prevNode = state.currentNode;
			
			// Set our new current node to the parent node of the previously current node
			state.currentNode = state.currentNode.parent;
			
			// Decrement node depth
			state.nodeDepth --;
			
			// Truncate parser state stack...
			state.parserStates.length = state.nodeDepth;
			
			// Finally, do we swallow any token components that match?
			// Check the state genus and act accordingly. If we destroy the token components, 
			// we just return. Otherwise, allow processing to continue based on the current token.
			
			// If the node was marked as invalid, the exit token will be already present in the
			// buffer. So we swallow it anyway...
			
			// And if it's the parent node which is closing, we have no right to swallow its tokens!
			
			if (!parentNodeClosed) {
				if (stateGenus.tokenGenus.swallowTokens !== false && !nodeInvalid) {
					// Remove the current match from the token, if we're permitted to swallow it...
					state.currentToken = state.currentToken.substring(matchPoint+matchLength);
					
					// After swallowing the exit condition, is there anything left to chew on? Return if not.
					if (!state.currentToken.length) return;
					
				} else if (matchPoint > 0) {
					// We're not swallowing tokens. But if the match point was greater than zero,
					// there'll be a duplicate token in there - which wasn't the exit token.
					
					state.currentToken = state.currentToken.substring(matchPoint);
				}
			}
		}
		
		// Search our current state list for exit conditions, closing nodes where necessary
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
			
			if (!stateGenus) throw new Error("State genus for the state " + currentState + " was not found! (" + state.parserStates.join(",") + ")");
			
			// If we've got an exit condition, and it matches the current token...
			if (stateGenus.exitCondition && stateGenus.exitCondition.exec(state.currentToken)) {
				
				// Have we closed the current node before attending to other nodes further up the stack?
				// Or have we run into a mismatch (does happen - we just have to be ready for it!)
				while (currentState !== state.currentNode.state) {
					
					// Mark current node as mismatched, and close it.
					// We'll leave it up to the state genus can determine what to do if
					// it's mismatched - we're not going to be presumptuous!
					state.currentNode.mismatched = true;
					closeCurrentNode(currentState,stateGenus,true);
				}
				
				// And now close the actual node we're supposed to be listening for...
				closeCurrentNode(currentState,stateGenus);
			}
		}
		
		if (Grammar.tokenMappings[state.currentToken] && Grammar.tokenMappings.hasOwnProperty(state.currentToken)) {
			
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
				// _and_ the semantics make sense (e.g. we're not inserting a block element inside
				// a text-level element)
				if (weCanWrap() && semanticsAreCorrect(tokenGenus)) {
					
					// Add this token's state to our state stack
					state.addParseState(tokenGenus.state);
					
					// Make a new node that represents this state
					var tmpDuckNode = new DuckdownNode(tokenGenus.state);
					
					// Save in all the relevant information...
					tmpDuckNode.stateStack	= state.parserStates.slice(0);
					tmpDuckNode.depth		= state.nodeDepth;
					tmpDuckNode.parent		= state.currentNode;
					tmpDuckNode.wrapper		= tokenGenus.wrapper;
					tmpDuckNode.token		= this.currentToken;
					
					if (tokenGenus.semanticLevel) {
						tmpDuckNode.semanticLevel = tokenGenus.semanticLevel;
					}
					
					// Do we have a previous sibling for this node?
					// If so, find it and save it into the node object!
					
					// Draw from the parser-buffer first if available...
					// (we select the first non-whitespace node)
					var nonWhitespaceBuffer =
							state.parseBuffer
								.filter(function(item) {
									return !!item.replace(/\s+/ig,"").length;
								});
					
					if (nonWhitespaceBuffer.length) {
						tmpDuckNode.previousSibling = nonWhitespaceBuffer.pop();
					} else {
						tree = (!!state.currentNode ? state.currentNode.children : state.parserAST);
						if (tree.length) tmpDuckNode.previousSibling = tree[tree.length-1];
					}
					
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
			
			// If we're at the end of the document, push data into the current node.
			if (state.tokenPosition >= state.tokens.length -1) {
				
				// We are not the root element. Flush the parse buffer into tne current node.
				if (!!state.currentNode) {
					state.currentNode.children.push.apply(state.currentNode.children,state.parseBuffer);
					
				// We are the root element. Flush the current parse-buffer to the AST root.
				} else {
					state.parserAST.push.apply(state.parserAST,state.parseBuffer);
				}
				
				state.parseBuffer = [];
			}
		}
		
		// Save the current token into the previous one!
		state.previousToken = state.currentToken;
		
		// Return parser states for this token as a css-compatible class string.
		return state.parserStates.join(" ").toLowerCase().replace(/\_/ig,"-");
	};
	
	// Compile from Duckdown intermediate format to the destination text format.
	Duckdown.prototype.compile = function(input) {
		
		// We're getting input this late in the game?
		// Well, we can deal with it, I guess.
		if (input) this.parse(input);
		
		// Emit compile event
		this.emit("compilestart");
		
		// Recurse through the AST, and return the result!
		var compileResult = (function duckpile(input) {
			var inputList = [];
			
			// Initially, we'll just assume our child list is the direct input
			inputList = input;
			
			// Buffer for storing compiled data
			var returnBuffer = "";
			
			// If this is a node, try and get the children.
			if (input instanceof DuckdownNode) inputList = input.children;
			
			// We've gotta make sure we can actually loop through the input...
			if (!(inputList instanceof Array)) return returnBuffer;
			
			// Loop through input...
			for (var index = 0; index < inputList.length; index++) {
				var currentNode = inputList[index];
				
				// If the current node we're dealing with is a DuckdownNode object,
				// we'll need to compile it first.
				if (currentNode instanceof DuckdownNode) {
					
					// We only add this node to the buffer if it has children.
					// It must also have some text, regardless of how deep we need to go to find it.
					if (currentNode.children.length && currentNode.text().length) {
						var stateGenus = Grammar.stateList[currentNode.state];
						
						if (stateGenus && stateGenus.compile && stateGenus.compile instanceof Function) {
							returnBuffer += stateGenus.compile(currentNode,duckpile);
						} else {
							returnBuffer += duckpile(currentNode);
						}
					}
				
				// Nope - our current node is a string or number, which we'll just coerce
				// to string and add to the return buffer.
				} else if (	typeof currentNode === "number" ||
							typeof currentNode === "string") {
					
					// Ensure basic XML/HTML compliance/escaping...
					var nodeText = currentNode;
					
					// But we check to see whether the replacer function was defined first.
					if (Grammar.replacer && Grammar.replacer instanceof Function) {
						nodeText = nodeText.replace(Grammar.escapeCharacters,Grammar.replacer);
					}
					
					// Just push this node onto our return buffer
					returnBuffer += nodeText;
					
				}
			}
			
			// Don't return a buffer that is only whitespace.
			if (!returnBuffer.replace(/\s+/g,"").length) return "";
			
			// If we're a block level, hybrid or textblock element, trim trailing and leading whitespace
			if (input instanceof DuckdownNode &&
				(
					input.semanticLevel === "block" ||
					input.semanticLevel === "textblock" ||
					input.semanticLevel === "hybrid"
				)) {
				
				returnBuffer = returnBuffer.replace(/^\s+/,"").replace(/\s+$/,"");
			}
			
			return returnBuffer;
			
		})(this.parserAST);
		
		this.emit("compileend",compileResult);
		
		return compileResult;
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
		
		
		this.emit("registerfeather",name,callback);
		this.feathers[name] = callback;
	};
	
	Duckdown.prototype.unregisterFeather = function(name) {
		if (!this.feathers[name]) throw new Error("Requested feather does not exist.");
		this.emit("unregisterfeather",name);
		
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
		this.emit("addstate",stateName);
		this.parserStates.push(stateName);
	};
	
	
	// We're also faking EventEmitter...
	// (faking so we can run in the browser without actually having to include the real EventEmitter)
	Duckdown.prototype.emit = function(name) {
		var self = this, args = arguments;
		
		// If we've lost our listener object, or have no listeners, just return.
		if (!this.eventListeners) return;
		
		// Ensure we've got listeners in the format we expect...
		if (!this.eventListeners[name] || !(this.eventListeners[name] instanceof Array)) return;
		
		// OK, so we have listeners for this event.
		this.eventListeners[name]
			// We need these to be functions!
			.filter(function(listener) {
				return listener instanceof Function;
			})
			.forEach(function(listener) {
				// Execute each listener in the context of the Duckdown object,
				// and with the arguments we were passed (less the event name)
				listener.apply(self,[].slice.call(args,1));
			});
		
	};
	
	Duckdown.prototype.on = function(name,listener) {
		// We must have a valid name...
		if (!name || typeof name !== "string" || name.match(/[^a-z0-9\.\*\-]/ig)) {
			throw new Error("Attempted to subscribe to event with invalid name!");
		}
		
		// We've gotta have a valid function
		if (!listener || !(listener instanceof Function)) {
			throw new Error("Attempted to subscribe to event without a listener function!");
		}
		
		// OK, we got this far.
		// Create listener object if it doesn't exist...
		if (!this.eventListeners || !(this.eventListeners instanceof Object)) {
			this.eventListeners = {};
		}
		
		if (this.eventListeners[name] && this.eventListeners[name] instanceof Array) {
			this.eventListeners[name].push(listener);
		} else {
			this.eventListeners[name] = [listener];
		}
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

})(this);