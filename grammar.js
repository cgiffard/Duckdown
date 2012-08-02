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
			"state"				: "AUTO_LINK",
			// The exit condition matches the first _non_ link character, so we shouldn't swallow it.
			"swallowTokens"		: false,
			"semanticLevel"		: "text"
		},
		"https://": {
			"wrapper"			: false,
			"exit"				: /[^a-z0-9\-_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\%\#\[\]\#]/i,
			"state"				: "AUTO_LINK",
			// The exit condition matches the first _non_ link character, so we shouldn't swallow it.
			"swallowTokens"		: false,
			"semanticLevel"		: "text"
		},
		"(": {
			"wrapper"			: true,
			"exit"				: /(\s\s+|\n|\))/,
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
					return "&amp;" + compiler(node.children);
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
				var buffer = compiler(node.children);
				
				// If node contains a single child with block, textblock, or hybrid semantics...
				var containsBlockChild = false;
				
				// This is a flat scan. A deep scan would be silly. (famous last words?)
				for (var childIndex = 0; childIndex < node.children.length; childIndex ++) {
					if (node.children[childIndex] instanceof Object &&
						node.children[childIndex].semanticLevel !== "hybrid" && 
						node.children[childIndex].semanticLevel !== "text") {
						
						containsBlockChild = true;
						break;
					}
				}
				
				if (!containsBlockChild) {
					return "<p>" + buffer + "</p>\n";
				} else {
					return buffer + "\n";
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