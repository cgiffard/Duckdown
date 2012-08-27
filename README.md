Duckdown [![Build Status](https://secure.travis-ci.org/cgiffard/Duckdown.png)](http://travis-ci.org/cgiffard/Duckdown)
========

Ultra-simple Markdown-inspired markup language, implemented initially in JS (targeting both the browser and node.)

Duckdown has a difference though - it doesn't work through naive regex hacks: It's a proper recursive descendant parser/state machine with a customisable grammar!

You can use it as is, extend it, or build your very own text markup language with it.

Writing with Duckdown
----------------------

Duckdown is intended to be very simple, and flexible, - but very strict and consequently unambiguous for authors.
Some aspects of Markdown were omitted or changed as we felt they were they were too complex for novice editors.

**WARNING: You should consider the API and text-specification unstable until further notice. Hopefully everything will be formalised soon.**

Like Markdown, Duckdown is primarily a line-based language. Inline text styling and linking are similar. Remember that
this document describes the *default* Duckdown grammar, and the parser is not necessarily bound by these same limitations or patterns.

### Bold, Italic, Underline, and Strikethrough <small>*Semantic Level: text*</small>

Bold, italic, and underline are specified by prepending a string of text with a token, and closing a given string with the same token.

	*This text is bold.*
	
	~This text is emphasised.~
	
	-This text is struck through-
	
	_This text is underlined._
	
	*This text is bold ~and this is bold & em!~*
	
	"When I asked her ~why~ she'd done it, she replied '*Just because.*'"

Duckdown is quite strict in what it considers valid. You may not wrap a text style over multiple lines. Opening tokens which aren't given breathing room
(they directly abut a word or non-significant token) will be ignored. Closing tokens which do not directly abut the string of text they close will be ignored.
Text-level tags which are not closed are considered invalid. Mismatched nesting is also considered invalid.

### Headings <small>*Semantic Level: textblock*</small>

Headings in Duckdown are described in only one way - by a tag at the beginning of the line, like so:

	h1. This is heading 1
	
	h2. This is heading 2 (With some ~emphasised~ text!)
	
Headings may contain inline tagging/styling, such as emphasis, strikethrough, or a link. Duckdown supports headings one (h1.) through six (h6.)

### Links <small>*Semantic Level: text*</small>

The primary rationale behind the Duckdown link syntax design is ease of use (and readability.) Secondarily, content archival and maintainability.

With that in mind, we've made the possibly controversial decision to scrap relative links. Instead, all links must include the full path (including the protocol!)
This ensures relative reorganisation of content will not break link relationships. Links are left plain, and simply included in text like so:

	http://www.example.com/
	
Of course, often it won't make much sense to include a URL in the middle of a sentence! In that circumstance you can use parentheses to add a link description:

	You can purchase http://example.com/barbeques/fourburner (four burner barbeques) at the Acme BBQ store.

It is possible to include any inline text styles in the link text.

	https://example.com/sinisterconspiracy.html (Recently, I chanced upon a sinister Mafia conspiracy involving none other than ~*The Queen herself!*~)

### Horizontal Rules <small>*Semantic Level: text*</small>

Horizontal rules can be embedded in any block element. Simply connect three dashes (`---`) like so:

	---

You may use the horizontal rule syntax in blockquotes and lists (among other block elements.)

### Lists

#### Bulletted / Unordered Lists

Bulletted (unordered) lists in Duckdown are very similar to those in Markdown. Simply begin a line with an asterisk (and then some whitespace) like so:

	* Oranges;
	* Apples,
	* Pears, and
	* Potatoes.

You must give the list some breathing room - it either has to be the first thing in the document, a direct child (and the first element) of a block level item like another list or blockquote, or be preceded by a blank line. The following is valid, and will be rendered as an unordered list:

	Here's a preceding paragraph. This is followed by a blank line.
	
	* Here's a list item.
	* Here's another list item. These will be rendered correctly.

On the other hand, without the blank line, the list will be interpreted as a continuation of the previous paragraph. The Duckdown snippet below:

	Here's a preceding paragraph. No blank line here, punks!
	* What are you expecting?
	* Hopefully not a UL here!
	* You'll be disappointed!

will be rendered as so in HTML:

	<p>Here's a preceding paragraph. No blank line here, punks! * What are you expecting? * Hopefully not a UL here! * You'll be disappointed!</p>
	
Failing to add whitespace after the asterisk will also prevent it from being considered a list item.

Lists may be nested by indenting them - either by a single tab or four spaces.

	* Here's a root-level list item.
		* Without leaving a blank line above, the next line is indented.
		* Both this line and the next will be rendered as second-level list items.
			* Here's a third-level item!

#### Numbered/Ordered Lists

### Blockquotes

### Feathers

### A word on text and block-level semantics

BLOCK!

### A word on encoding

ENCODING!

### A word on indentation



Using Duckdown
==============

In The Browser
--------------


CLI
---

	duck
	.version(PackageInfo.version)
	.option("-t, --tokens","Output tokens")
	.option("-a, --ast","Show parse/AST tree")
	.option("-l, --log","Show parse log")
	.option("-d, --disk","Write parse log to disk")
	.option("-v, --verbose","Verbose output")
	.option("-s, --surpress","Surpress compiled output")
	.option("-e, --echo","Include raw duckdown in output")
	.option("-b, --build","Build duckdown for the browser")
	.parse(process.argv);


Node API
--------

Events emitted by the Duckdown parser
* clear
* tokenisestart
* tokeniseend
* parsestart
* parseend
* parsetoken
* compilestart
* compileend
* addstate
* nodeclosed
* nodeinvalid
* nodeselfdestruct

Be aware that duckdown doesn't try and clean up after you. If you throw an error in an event listener, you'll kill the current operation at hand.


Using Duckdown in the browser
-----------------------------



Building Duckdown
------------------



Writing a Duckdown Grammar
--------------------------


How Duckdown works
------------------

Tokenisation

State stack

Node invalidation!

Node processing and self-destruction

Licence & Credits
------------------

**Who's responsible for this monstrosity!?**

Christopher Giffard, with contributions to the test suite and language design by Daniel Nitsche. This project was undertaken at the Australian Department of Education, Employment, and Workplace Relations (but of course, any opinions expressed here or anywhere else are purely my own!)

**And the licence? BSD 2-Clause!**

Copyright (c) 2012, Christopher Giffard.

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.