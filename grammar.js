// Duckdown Grammar Definitions
/*globals require:true module:true define:true*/

(function(glob) {
	
	"use strict";
	
	// Set up our grammar object
	var Grammar = {};
	
	// Word characters
	// Used for defining token boundries and splitting tokens from 
	Grammar.wordCharacters = /[a-z0-9 ]/ig;
	
	// Token Mappings
	// Used for defining token boundries for tokenisation and mapping tokens to states.
	//
	Grammar.tokenMappings = {
		"\n": {
			
		},
		// XML/HTML Entity...
		"&": {
			// Determines whether this is a one-off token, or whether it wraps other elements.
			"wrapper"			: false,
			// Remove the associated state from the state stack if the following condition is met for the token.
			"exit"				: /([^#a-z0-9]|;)/i,
			// Upon termination of the associated state, we do a check against the entire text from the beginning
			// of the token to the end of the token (including all text inside it.)
			// If this condition matches, we discard the token, and treat it as text.
			"validIf"			: /^&#?[a-z0-9]+;$/ig,
			// Matches this token to a corresponding parser state.
			"state"				: "ENTITY"
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
			"allowSelfNesting"	: false,
			"exit"				: /[\~\n]/,
			"validIf"			: /^\~[a-z0-9][^\n]+[a-z0-9]\~$/,
			"state"				: "TEXT_EMPHASIS"
		},
		// Bold
		"*": {
			"semanticLevel"		: "text",
			"wrapper"			: "false",
			"allowSelfNesting"	: false,
			"exit"				: /[\*\n]/,
			// We're bold if there's no space after the asterisk.
			// Otherwise, it's considered a floating asterisk or a bullet.
			"validIf"			: /^\*\S[^\n]+\*$/,
			"state"				: "TEXT_STRONG"
		},
		// Feathers
		"<": {
			// Feathers are callouts to other functions. They do not wrap other Duckdown tokens.
			"wrapper"			: false,
			// This could have both text _or_ block level semantics, depending on what the
			// registered feather function returns. It's never a wrapper though.
			"semanticLevel"		: "hybrid",
			"exit"				: /[>\n]/,
			"validIf"			: /^<[a-z][a-z0-9\-\_]*[^>\n]+>$/i,
			"state"				: "SPECIAL_FEATHER"
		}
	};
	
	// Parser states
	// Used for storing all the possible simultaneous states the parser could have
	// These states may describe bold text, nesting depth, special temporary cursor status, etc.
	Grammar.stateList = {
		"ENTITY": {
			"process": function() {
				
			}
		},
		"TEXT_EMPHASIS": {
			"process": function() {
				
			}
		},
		"TEXT_STRONG": {},
		"SPECIAL_FEATHER": {
			"process": function() {
				
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