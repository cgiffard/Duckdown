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
			"state"				: "TEXT_DEL",
			"wrapper"			: true,
			"semanticLevel"		: "text",
			"exit"				: /[\-\n]/,
			"validIf"			: /^\-\S[^\n]+\S\-$/,
			"blankPrevSibling"	: true
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
		// Bulletted list item...
		"* ": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "LIST_UNORDERED",
			"semanticLevel"		: "textblock",
			"swallowTokens"		: false
		},
		// Bulletted list item...
		"*\t": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "LIST_UNORDERED",
			"semanticLevel"		: "textblock",
			"swallowTokens"		: false
		},
		// Blockquote
		">": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "BLOCKQUOTE",
			"semanticLevel"		: "block",
			"swallowTokens"		: false
		},
		// Headings, 1 - 6
		"h1.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "HEADING_1",
			"semanticLevel"		: "textblock"
		},
		"h2.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "HEADING_2",
			"semanticLevel"		: "textblock"
		},
		"h3.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "HEADING_3",
			"semanticLevel"		: "textblock"
		},
		"h4.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "HEADING_4",
			"semanticLevel"		: "textblock"
		},
		"h5.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "HEADING_5",
			"semanticLevel"		: "textblock"
		},
		"h6.": {
			"wrapper"			: true,
			"exit"				: /\n/i,
			"state"				: "HEADING_6",
			"semanticLevel"		: "textblock"
		},
		// Link detection
		"http://": {
			"state"				: "AUTO_LINK",
			"wrapper"			: false,
			"exit"				: /[^a-z0-9\-_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\%\#\[\]\#]/i,
			"validIf"			: /^http[s]?:\/\/[a-z0-9\-\.]+(\:\d+)?.*$/i,
			// The exit condition matches the first _non_ link character, so we shouldn't swallow it.
			"swallowTokens"		: false,
			// But we should probably swallow whitespace - we can write it back out again if we're not followed
			// by a PAREN_DESCRIPTOR after all.
			"swallowWhitespace"	: true,
			"semanticLevel"		: "text"
		},
		"https://": {
			"state"				: "AUTO_LINK",
			"wrapper"			: false,
			"exit"				: /[^a-z0-9\-_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\%\#\[\]\#]/i,
			"validIf"			: /^http[s]?:\/\/[a-z0-9\-\.]+(\:\d+)?.*$/i,
			// The exit condition matches the first _non_ link character, so we shouldn't swallow it.
			"swallowTokens"		: false,
			// But we should probably swallow whitespace - we can write it back out again if we're not followed
			// by a PAREN_DESCRIPTOR after all.
			"swallowWhitespace"	: true,
			"semanticLevel"		: "text"
		},
		"(": {
			"state"				: "PAREN_DESCRIPTOR",
			"wrapper"			: true,
			"exit"				: /(\s\s+|\n|\))/,
			"validIf"			: /^\([^\n]+\)$/,
			// We allow self-nesting because there might be parens in a link description,
			// and we want to remain balanced!
			"allowSelfNesting"	: true,
			"semanticLevel"		: "text"
		},
		"-- ": {
			"state"				: "CITATION",
			"exit"				: /\n/,
			"wrapper"			: true,
			"semanticLevel"		: "text",
			"swallowTokens"		: false
		},
		"--": {
			"state"				: "HORIZONTAL_RULE",
			"wrapper"			: false,
			"exit"				: /[^\-]/i,
			"validIf"			: /^\-\-+\n*$/i,
			"semanticLevel"		: "block",
			"swallowTokens"		: false
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
				
				// Check to see whether we contain an alternate block or hybrid level element.
				// If so, mark as such for future processing!
				node.blockParent = false;
				
				// This is a flat scan. A deep scan would be silly. (famous last words?)
				for (var childIndex = 0; childIndex < node.children.length; childIndex ++) {
					if (node.children[childIndex] instanceof Object &&
						node.children[childIndex].semanticLevel !== "hybrid" && 
						node.children[childIndex].semanticLevel !== "text") {
						
						node.blockParent = true;
						break;
					
					// And we don't compile a wrapper around implicit indents either.
					} else if (node.children[childIndex].state === "IMPLICIT_INDENT") {
						
						node.blockParent = true;
						break;
					}
				}
			},
			
			// Compiler...
			"compile": function(node,compiler) {
				
				// Compile children.
				var buffer = compiler(node);
				
				// If node contains a single child with block, textblock, or hybrid semantics...
				// or an implicit_indent object...
				var compileWithWrapper = !node.blockParent;
				
				if (compileWithWrapper) {
					
					var openParagraph = false, closeParagraph = false;
					
					// If we don't have a previous sibling (meaning we're the first node or AST child) - OR -
					// our previous sibling was an implicit break and was culled (meaning there was a double
					// line break prior to us) then we need to open a paragraph.
					if (!node.previousSibling || (node.prevSiblingCulled && node.prevCulledSiblingState === "IMPLICIT_BREAK")) {
						
						openParagraph = true;
					}
					
					// If we don't have a next-sibling (meaning we're the last node or AST child) - OR -
					// our next sibling was an implicit break and was culled (meaning there's a double line-break
					// after us) then we need to close our paragraph.
					if (!node.nextSibling || (node.nextSiblingCulled && node.nextCulledSiblingState === "IMPLICIT_BREAK")) {
						
						closeParagraph = true;
					}
					
					// Alternately, if the next sibling is a block parent of another variety...
					// That is - it contains a block level element like a list item, blockquote, etc.
					// Or, it has no children, meaning it'll be culled.
					if (node.nextSibling && (node.nextSibling.blockParent || !node.nextSibling.children.length)) {
						
						closeParagraph = true;
					}
					
					// Don't want to append a space to the buffer if it finishes with one already.
					var finalSpace = buffer.match(/\s+$/i) ? "" : " ";
					
					if (openParagraph) buffer = "<p>" + buffer;
					buffer += closeParagraph ? "</p>\n" : finalSpace;
					
					return buffer;
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
				
				// If we're the direct child of an implicit break,
				// hybrid, or block level element, and we're not part
				// of a larger paragraph, then we compile as preformatted text.
				// otherwise, just compile our children and return...
				
				// List of states which will prevent us from compiling preformatted...
				
				var compilePreformatted = false;
				
				// If we don't have a parent element (not sure how that would happen...)
				// Or we have a previous sibling...
				// If we are the direct child of an implicit break
				// or a block or hybrid element...
				if (!node.parent							||
					node.previousSibling					||
					node.parent.state === "IMPLICIT_BREAK"	||
					node.parent.semanticLevel === "block"	||
					node.parent.semanticLevel === "hybrid"	) {
					
					// If we don't have a parent, somehow
					if (!node.parent) {
						compilePreformatted = true;
					
					// If we don't have a prior sibling,
					// we're not part of a larger paragraph!
					} else if (!node.parent.previousSibling) {
						compilePreformatted = true;
					
					// Or there was a double-line-break and the previous sibling was culled
					} else if (node.parent.prevSiblingCulled && node.parent.prevCulledSiblingState === "IMPLICIT_BREAK") {
						compilePreformatted = true;
					}
				}
				
				if (compilePreformatted) {
					// TODO grouped preformatted text.
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
			"process": function(node) {
				// If we're the first element in our parent node, we're not part of a phrase like
				// "We waited over 6-7 minutes" which can cause problems with this token genus.
				if (!node.previousSibling) return true;
				
				// If we're preceded by whitespace, consider our starting token valid.
				if (typeof node.previousSibling === "string" && node.previousSibling.match(/\s+$/)) return true;
				
				// Otherwise, dump our children back into the AST.
				return -1;
			},
			
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
		"LIST_UNORDERED": {
			"process": function(node) {
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				var buffer = "";
				
				if (!node.parent.previousSibling ||
					node.parent.prevSiblingCulled ||
					!node.parent.previousSibling.blockParent ||
					!node.parent.previousSibling.children.length || 
					(
						node.parent.previousSibling.children[0].state !== "LIST_UNORDERED" && 
						node.parent.previousSibling.children[0].state !== "IMPLICIT_INDENT"
					)) {
					
					buffer += "<ul>\n";
				}
				
				buffer += "<li>" + compiler(node) + "</li>\n";
				
				if (!node.parent.nextSibling ||
					node.parent.nextSiblingCulled ||
					!node.parent.nextSibling.blockParent ||
					!node.parent.nextSibling.children.length || 
					(
						node.parent.nextSibling.children[0].state !== "LIST_UNORDERED" && 
						node.parent.nextSibling.children[0].state !== "IMPLICIT_INDENT"
					)) {
					
					buffer += "</ul>\n";
				}
				
				return buffer;
			}
		},
		"BLOCKQUOTE": {
			"process": function(node) {
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				var buffer = "";
				
				if (!node.parent.previousSibling ||
					node.parent.prevSiblingCulled ||
					!node.parent.previousSibling.blockParent ||
					!node.parent.previousSibling.children.length || 
					(
						node.parent.previousSibling.children[0].state !== "BLOCKQUOTE" && 
						node.parent.previousSibling.children[0].state !== "IMPLICIT_INDENT"
					)) {
					
					buffer += "<blockquote>\n";
				}
				
				buffer += compiler(node) + "\n";
				
				if (!node.parent.nextSibling ||
					node.parent.nextSiblingCulled ||
					!node.parent.nextSibling.blockParent ||
					!node.parent.nextSibling.children.length || 
					(
						node.parent.nextSibling.children[0].state !== "BLOCKQUOTE" && 
						node.parent.nextSibling.children[0].state !== "IMPLICIT_INDENT"
					)) {
					
					buffer += "</blockquote>\n";
				}
				
				return buffer;
			}
		},
		"CITATION": {
			"process": function(node) {
				// A return value of -1 leaves the components of a self-destructed token
				// in the document as plain text - whereas a false return value culls it
				// from the document.
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				return "<cite>" + compiler(node) + "</cite>";
			}
		},
		"HEADING_1": {
			"process": function(node) {
				// A return value of -1 leaves the components of a self-destructed token
				// in the document as plain text - whereas a false return value culls it
				// from the document.
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				return "<h1>" + compiler(node) + "</h1>";
			}
		},
		"HEADING_2": {
			"process": function(node) {
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				return "<h2>" + compiler(node) + "</h2>";
			}
		},
		"HEADING_3": {
			"process": function(node) {
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				return "<h3>" + compiler(node) + "</h3>";
			}
		},
		"HEADING_4": {
			"process": function(node) {
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				return "<h4>" + compiler(node) + "</h4>";
			}
		},
		"HEADING_5": {
			"process": function(node) {
				if (node.previousSibling) return -1;
			},
			"compile": function(node,compiler) {
				return "<h5>" + compiler(node) + "</h5>";
			}
		},
		"HEADING_6": {
			"process": function(node) {
				if (node.previousSibling) return -1;
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
				
				var buffer = "<a href=\"" + linkURL + "\">" + linkText + "</a>";
				
				if (node.exitToken.match(/\s+/) && !node.linkDetail) buffer += " ";
				
				return buffer;
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
		"HORIZONTAL_RULE": {
			//"process": function(node) {
			//	// We've gotta be the first thing in our container.
			//	if (node.previousSibling) return false;
			//},
			"compile": function(node,compiler) {
				return "<hr />";
			}
		},
		"SPECIAL_FEATHER": {
			
			// Function for processing feathers!
			// Language specific, so not part of parser core.
			// Function is called with the parser object as its context,
			// so 'this' points to the parser object.
			
			"process": function(featherNode) {
				
				// If there's no children, there's nothing to go on. Die.
				if (!featherNode.children.length) return -1;
				
				// Feathers treat tokens differently.
				// Join and re-split tokens by whitespace...
				var featherTokens = featherNode.children.join("").split(/\s+/ig);
				
				// Storage for feather name
				var featherName = featherTokens.shift().replace(/\s+/ig,"");
				
				// Storage for parameters passed to feather function
				var parameterHash = {};
				
				// If we couldn't get a feather name, there's no point continuing.
				if (!featherName.length) return -1;
				
				// And if the feather name exists and is a function...
				if (this.feathers[featherName] && this.feathers[featherName] instanceof Object &&
					this.feathers[featherName].handler && this.feathers[featherName].handler instanceof Function) {
					
					// Now clear children from the node, because we'll replace them soon...
					featherNode.children = [];
					
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
					var returnedData = this.feathers[featherName].handler.call(featherNode,parameterHash,this);
					
					// Mark as compiled!
					featherNode.compiled = true;
					
					// Replace children with result from feather function
					// ...but only if we received a string, or a number.
					
					if (typeof returnedData === "string" ||
						typeof returnedData === "number") {
						
						featherNode.children = [returnedData];
					}
					
					// Return.
					return;
				}
				
				// Or just return.
				return -1;
			},
			
			// Compile, so our children aren't mercilessly escaped by the duckpiler.
			"compile": function(node,compiler) {
				return node.children.join("");
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