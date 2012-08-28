![Duckdown](http://cgiffard.github.com/Duckdown/logo.jpg)

Duckdown [![Build Status](https://secure.travis-ci.org/cgiffard/Duckdown.png)](http://travis-ci.org/cgiffard/Duckdown)
========

Ultra-simple Markdown-inspired markup language, implemented initially in JS 
(targeting both the browser and node.)

Duckdown has a difference though - it doesn't work through naive regex hacks: It's 
a proper recursive descendant parser/state machine with a customisable grammar!

**You can use it as is, extend it, or build your very own text markup language with it.**

Writing with Duckdown
----------------------

Duckdown is intended to be very simple, and flexible, - but very strict and 
consequently unambiguous for authors.
Some aspects of Markdown were omitted or changed as we felt they were they were 
too complex for novice editors.

**WARNING: You should consider the API and text-specification unstable until
further notice. Hopefully everything will be formalised soon.**

Like Markdown, Duckdown is primarily a line-based language. Inline text styling 
and linking are similar. Remember that
this document describes the *default* Duckdown grammar, and the parser is not 
necessarily bound by these same limitations or patterns.

### Bold, Italic, Underline, and Strikethrough
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) text*

Bold, italic, and underline are specified by prepending a string of text with a 
token, and closing a given string with the same token.

	*This text is bold.*
	
	~This text is emphasised.~
	
	-This text is struck through-
	
	_This text is underlined._
	
	*This text is bold ~and this is bold & em!~*
	
	"When I asked her ~why~ she'd done it, she replied '*Just because.*'"

Duckdown is quite strict in what it considers valid. You may not wrap a text style 
over multiple lines. Opening tokens which aren't given breathing room (they 
directly abut a word or non-significant token) will be ignored. Closing tokens 
which do not directly abut the string of text they close will be ignored.
Text-level tags which are not closed are considered invalid. Mismatched nesting is 
also considered invalid.

### Headings
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) textblock*

Headings in Duckdown are described in only one way - by a tag at the beginning of 
the line, like so:

	h1. This is heading 1
	
	h2. This is heading 2 (With some ~emphasised~ text!)
	
Headings may contain inline tagging/styling, such as emphasis, strikethrough, or
a link. Duckdown supports headings one (h1.) through six (h6.)

### Links
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) text*

The primary rationale behind the Duckdown link syntax design is ease of use (and 
readability.) Secondarily, content archival and maintainability.

With that in mind, we've made the possibly controversial decision to scrap 
relative links. Instead, all links must include the full path (including the 
protocol!) This ensures relative reorganisation of content will not break link 
relationships. Links are left plain, and simply included in text like so:

	http://www.example.com/
	
Of course, often it won't make much sense to include a URL in the middle of a 
sentence! In that circumstance you can use parentheses to add a link description:

	You can purchase http://example.com/barbeques/fourburner (four burner barbeques) at the Acme BBQ store.

It is possible to include any inline text styles in the link text.

	https://example.com/sinisterconspiracy.html (Recently, I chanced upon a sinister Mafia conspiracy involving none other than ~*The Queen herself!*~)

### Horizontal Rules
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) block*

Horizontal rules can be embedded in any block element. Simply connect three dashes 
(`---`) on a separate line, like so:

	---

You may use the horizontal rule syntax in blockquotes and lists (among other block 
elements.)

### Lists
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) textblock*

##### Bulletted / Unordered Lists

Bulletted (unordered) lists in Duckdown are very similar to those in Markdown. 
Simply begin a line with an asterisk (and then some whitespace) like so:

	* Oranges;
	* Apples,
	* Pears, and
	* Potatoes.

You must give the list some breathing room - it either has to be the first thing 
in the document, a direct child (and the first element) of a block level item like 
another list or blockquote, or be preceded by a blank line. The following is 
valid, and will be rendered as an unordered list:

	Here's a preceding paragraph. This is followed by a blank line.
	
	* Here's a list item.
	* Here's another list item. These will be rendered correctly.

On the other hand, without the blank line, the list will be interpreted as a 
continuation of the previous paragraph. The Duckdown snippet below:

	Here's a preceding paragraph. No blank line here, punks!
	* What are you expecting?
	* Hopefully not a UL here!
	* You'll be disappointed!

will be rendered as so in HTML:

	<p>Here's a preceding paragraph. No blank line here, punks! * What are you expecting? * Hopefully not a UL here! * You'll be disappointed!</p>
	
Failing to add whitespace after the asterisk will also prevent it from being 
considered a list item.

Lists may be nested by indenting them - either by a single tab or four spaces.

	* Here's a root-level list item.
		* Without leaving a blank line above, the next line is indented.
		* Both this line and the next will be rendered as second-level list items.
			* Here's a third-level item!

##### Numbered/Ordered Lists

Unlike ordered lists in Markdown, Duckdown supports flexible list tokens designed 
to make the raw Duckdown much easier to read. It also explicitly supports three 
different list types:

* Numeric - the default display style for a regular ordered list.
* Lower, roman - lowercase roman numerals
* Alphabetical, lowercase

In order to specify the list type, just use a letter, number, or romal numeral 
accordingly - and then a full stop (period) and some whitespace.

	1. Ordered List 1
	2. Ordered List 2
	3. Ordered List 3
	
	a. Important legal subsection a!
	b. Important legal subsection b!
	c. Important legal subsection c!
	
	i. Important roman-numeral list!
	ii. Important...
	iii. Roman...
	iv. Numeral...
	v. List!
	
Duckdown automatically determines the list type based on the first item in the 
list. Consider a list which changes types halfway through, like so:

	a. Alphabetic item!
	ii. Roman Numeral Item!
	3. Regular Numbered Item!
	
In this case, the first item in the list takes precedence, and the whole list is 
ordered alphabetically.

This restriction does not apply to nested lists - you may nest ordered lists 
inside any other block element or list - just as you would an ordered list.

	1. Item 1
		a. Alphabetic list nested beneath regular ordered list
		b. Item b.
	2. Item 2
		i. Roman numeral sub-list!
			* And of course, it's possible to nest bullets as well.

### Blockquotes

*[Semantic Level:](#a-word-on-text-and-block-level-semantics) block*

Duckdown supports blockquotes as multiple concurrent lines prepended with a caret '>'.

	This text is outside the blockquote.
	
	> This text is inside the blockquote. The text in 
	> blockquotes is also consolidated into paragraphs
	> just like regular text.
	>
	> Separated by a blank line, this is a new paragraph
	> inside the blockquote.
	
	This text is outside the blockquote.

You may add attribution to the blockquote by appending a citation on the following 
like like so:

	> The march of science and technology does not imply growing
	> intellectual complexity in the lives of most people.
	> It often means the opposite.
	-- Thomas Sowell
	
This adds a new paragraph with a linked `<cite>` tag.

You may also nest blockquotes:

	> Two hours ago, MATSUMOTO Hiroshi wrote:
	>
	> I don't agree with your assertion as stated in your last email:
	>
	>> Four hours ago, Jacob Slim wrote:
	>>
	>> Shouldn't the API endpoint be idempotent regardless of the version?
	>> This is a data integrity issue.
	>
	> This isn't a data integrity issue - this is about making things
	> easy to understand for app developers.
	
### Preformatted Text

*[Semantic Level:](#a-word-on-text-and-block-level-semantics) block*

Preformatted text works in exactly the same way as Markdown: indent each line of a 
preformatted block with either a single tab or four spaces. In the example below, 
consider `\t` equal to one tab character.

	\tHere's a block of preformatted text.
	\tHere's another line. No further processing occurrs in this region.

### Feathers

*[Semantic Level:](#a-word-on-text-and-block-level-semantics) hybrid (may be overridden by feather function)*

One of the key considerations leading to the development of Duckdown (as opposed 
to using Markdown) was extensibility. We needed a way to incorporate extra 
functionality into the syntax without polluting it, and since the language is 
designed to be independent from HTML, we could not use HTML to cover these use 
cases.

Some examples of this functionality might be:

* Tweet (or social) buttons
* Inlining external content
* Inline video
* Image galleries and other embedded multimedia

Because a lot of this content is also site or application specific, it didn't make 
sense to include it in the Duckdown core either.

Instead, I created a method of calling external JavaScript procedures from 
Duckdown itself, (in keeping with the Duck theme) named *Feathers.*

Feathers look similar to an HTML tag, with a different parameter syntax:

	<feathername param:value paramtwo:value>
	
In this case, we've already registered a handler with Duckdown, with the name 
`feathername`. Duckdown chops up the parameters, and passes them to the feather 
function as a big object (containing strings.) In this case, such an object would 
look like the following:

	{
		"param": "value",
		"paramtwo": "value"
	}
	
It's totally up to the function defined as to how it handles the parameters. The 
content of the feather node is replaced with whatever it returns immediately upon 
execution - although asynchronous code in the handler can retain a reference to 
the node in question and act on it (mutate it in any way it wants!) before 
compilation.

(The exact way in which feathers work is detailed further down the page.)

The parameters may have spaces in the values, but not in the names. The parameter 
values need not be quoted, but the closing caret (`>`) character must be escaped 
or avoided.

An example of real-word feather use could include embedding a video in the page:

	<video external:true source:youtube id:v982fSFd2 showcomments:false caption:Prime Minister Gordon Brown being introduced to visiting dignitaries.>
	
This would result in the following hash:

	{
		"external": "true",
		"source": "youtube",
		"id": "v982fSFd2",
		"showcomments": "false",
		"caption": "Prime Minister Gordon Brown being introduced to visiting dignitaries."
	}
	
The feather function would then take this information, and generate the 
appropriate HTML embed code for the video.

### A word on text and block-level semantics

Duckdown inherits an HTML-like understanding of block/text semantics.

Each token/language construct has a semantic class associated with it. These are:

* text
* textblock
* hybrid
* block

This concept, like in HTML, defines reasonable defaults around nesting behaviour:

* A block level element is permitted to nest only within other blocks, 
  and hybrid elements. It can contain any other element, regardless of text
  semantics.
* A hybrid element can contain any element, and nest within any element.
  It is mainly used for elements where the semantics are indefinite,
  such as feathers.
* A textblock can nest within hybrid and block elements, but not text or other
  textblock elements. Only text elements can be contained within it.
  An example of a textblock element would be a heading.
* A text element can nest within any element, but can only contain other
  text elements

This function returns true or false depending on the nesting compatibility.
If no current node is present, and the new node is being inserted directly
into the document, this function will return true regardless of text semantics.

### A word on encoding

Duckdown works with the regular JavaScript string methods, and is bound by the 
restrictions of the VM it runs in (in nearly all cases, this means Duckdown will 
output UCS-2 in a way that is functionally indistinguishable from UTF-8.)

Any character which does not fit into the first 128 printable ASCII characters, or 
is not permitted in XML will be escaped as XML/HTML hexadecimal entities.

Using Duckdown
==============

Duckdown may be run on the server or in the browser. Let's start with node.

Installing
--------------

If you're using `npm`, you may install Duckdown locally or globally. Installing
globally will permit you to easily use Duckdown's CLI tool.

	npm install -g duckdown
	
If you plan on running the tests or building Duckdown yourself, you should install
the development dependencies:

	npm install -g --dev duckdown
	
And if you're using `git`:

	git clone https://github.com/cgiffard/Duckdown.git
	cd Duckdown
	npm install
	
Running `npm install` in the git repo will ensure that the required dependencies 
for testing and building Duckdown are available.

CLI
---

If you installed Duckdown globally, you should now have a `duck` CLI tool 
available to you in your `$PATH`.

Usage is simple. By default, the tool accepts uncompiled Duckdown on `STDIN` and
pipes compiled HTML to `STDOUT`.

You may specify a filename to compile:

	duck README.dd

Options:

* **`-t`, `--tokens`**
	*<br />Outputs an array of tokens from the original text, prior to parsing.*
* **`-a`, `--ast`**
	*<br />Outputs the Duckdown AST for the file or input, prior to parsing.*
* **`-l`, `--log`**
	*<br />Displays the Duckdown parse log, along with the cumulative execution
	time. Log items are gathered via parser events (See [Events](#events))*
* **`-d`, `--disk`**
	*<br />Write parse log to disk*
* **`-v`, `--verbose`**
	*<br />Verbose output - returns extra data in the log, as well as detailled
	attributes for AST nodes when outputting the AST.*
* **`-s`, `--surpress`**
	<br />*Surpress compiled output - in circumstances where you're just 
	interested, for example, in the tokens, log, or AST, you can surpress display 
	of the compiled HTML.*
* **`-e`, `--echo`**
	*<br />Include raw duckdown in output*
* **`-b`, `--build`**
	*<br />Builds a combined JS file representing the Duckdown source, intended 
	for use in the browser, in both minified and unminified forms. Development 
	dependencies are required in order to use this option.
	You may specify a filename to write to - which will be considered the name of 
	the 'minified' version. The unminified version will have '-unminified' 
	appended to the name.*

Example usage:
	
	# Surpresses compiled output, but displays tokens and an AST verbosely
	duck -atvs myDuckdownDocument.dd
	
	# Build duckdown to the current folder
	duck -b ./duckdown.js


Using the Duckdown API
----------------------

Fundamentally, the Duckdown API is very simple. Depending on whether you're using 
it with node or in the browser, the method of instantiation will be different - 
but the subsequent use is the same across platforms.

Basically, you'll want to create a new instance of the Duckdown parser. In node,
you'll need to require it. In the browser, just include the compiled version of
Duckdown ([you can find the latest build at Github.](https://raw.github.com/cgiffard/Duckdown/master/compiled/duckdown.js))

	// Instantiating Duckdown in Node
	var Duckdown = require("duckdown"),
		duckdown = new Duckdown();
	
	// Instantiating Duckdown in the browser
	var duckdown = new Duckdown();

Assuming you've already got the text you want to compile in a variable,
compilation can be as simple as one call:

	var compiledHTML = duckdown.compile(myRawDuckdown);
	
There's a catch though - in order to enable streaming, the parser retains any
input it receives, so subsequent compilations will include the Duckdown of the
calls before them. You'll need to clear the parser object before compiling again:

	duckdown.clear();
	var myNewCompiledHTML = duckdown.compile(someOtherDocument);

That's it! You're good to go.

How Duckdown works
------------------

Still here? OK - Here's a little more about what this does.

The above method hides a lot of complexity. Behind the scenes, a number of major functions are called:

* **Duckdown.tokenise**<br />
	Turns the raw text into tokens dictated by the grammar
* **Duckdown.parse**<br />
	Parses the tokens into an intermediary AST
	* **Duckdown.parseToken**<br />
		Called by the Duckdown parser, this function is responsible for the brunt 
		of the work. It parses an individual token according to state stored in 
		the Duckdown parser object itself.
	* **Duckdown.completeParse**<br />
		Finalises a parse operation (Technically speaking, it restores pointers to the AST root, closing any open nodes.)
* **Duckdown.compile**<br />
	Actually compiles the sourcecode. Recursively loops through the AST,
	and calls out to compilation handlers defined by the grammar where required.

### Events

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



Tokenisation

State stack

Node invalidation!

Node processing and self-destruction


Writing a Duckdown Grammar
--------------------------


Licence & Credits
------------------

**Who's responsible for this monstrosity!?**

Christopher Giffard, with contributions to the test suite and language design by Daniel Nitsche.

**And the licence? BSD 2-Clause!**

Copyright (c) 2012, Christopher Giffard.

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.