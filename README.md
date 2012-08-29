![Duckdown](http://cgiffard.github.com/Duckdown/logo.jpg)

Duckdown [![Build Status](https://secure.travis-ci.org/cgiffard/Duckdown.png)](http://travis-ci.org/cgiffard/Duckdown)
========

Ultra-simple Markdown-inspired markup language, implemented initially in JS 
(targeting both the browser and node.)

Duckdown has a difference though - it doesn't work through naive regex hacks:
It's a proper recursive descendant parser/state machine with a customisable
grammar!

**You can use it as is, extend it, or build your very own text markup language
with it.**

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

Duckdown is quite strict in what it considers valid. You may not wrap a text
style over multiple lines. Opening tokens which aren't given breathing room
(they directly abut a word or non-significant token) will be ignored. Closing
tokens which do not directly abut the string of text they close will be ignored. 
Text-level tags which are not closed are considered invalid. Mismatched nesting
is also considered invalid.

### Headings
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) textblock*

Headings in Duckdown are described in only one way - by a tag at the beginning
of the line, like so:

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
sentence! In that circumstance you can use parentheses to add a link
description:

	You can purchase http://example.com/barbeques/fourburner (four burner barbeques) at the Acme BBQ store.

It is possible to include any inline text styles in the link text.

	https://example.com/sinisterconspiracy.html (Recently, I chanced upon a sinister Mafia conspiracy involving none other than ~*The Queen herself!*~)

### Horizontal Rules
*[Semantic Level:](#a-word-on-text-and-block-level-semantics) block*

Horizontal rules can be embedded in any block element. Simply connect three
dashes (`---`) on a separate line, like so:

	---

You may use the horizontal rule syntax in blockquotes and lists (among other
block elements.)

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
in the document, a direct child (and the first element) of a block level item
like another list or blockquote, or be preceded by a blank line. The following
is valid, and will be rendered as an unordered list:

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

Unlike ordered lists in Markdown, Duckdown supports flexible list tokens
designed to make the raw Duckdown much easier to read. It also explicitly
supports three different list types:

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

Duckdown supports blockquotes as multiple concurrent lines prepended with a
caret '>'.

	This text is outside the blockquote.
	
	> This text is inside the blockquote. The text in 
	> blockquotes is also consolidated into paragraphs
	> just like regular text.
	>
	> Separated by a blank line, this is a new paragraph
	> inside the blockquote.
	
	This text is outside the blockquote.

You may add attribution to the blockquote by appending a citation on the
following like like so:

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

Preformatted text works in exactly the same way as Markdown: indent each line of 
a preformatted block with either a single tab or four spaces. In the example
below, consider `\t` equal to one tab character.

	\tHere's a block of preformatted text.
	\tHere's another line. No further processing occurrs in this region.

### Feathers

*[Semantic Level:](#a-word-on-text-and-block-level-semantics) hybrid (may be
overridden by feather function)*

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

Because a lot of this content is also site or application specific, it didn't
make sense to include it in the Duckdown core either.

Instead, I created a method of calling external JavaScript procedures from 
Duckdown itself, (in keeping with the Duck theme) named *Feathers.*

Feathers look similar to an HTML tag, with a different parameter syntax:

	<feathername param:value paramtwo:value>
	
In this case, we've already registered a handler with Duckdown, with the name
`feathername`. Duckdown chops up the parameters, and passes them to the feather
function as a big object (containing strings.) In this case, such an object
would look like the following:

	{
		"param": "value",
		"paramtwo": "value"
	}
	
It's totally up to the function defined as to how it handles the parameters. The 
content of the feather node is replaced with whatever it returns immediately
upon execution - although asynchronous code in the handler can retain a
reference to the node in question and act on it (mutate it in any way it wants!) 
before compilation.

The exact way in which feathers work are described in more detail
[later in this document](#using-feathers).

The parameters may have spaces in the values, but not in the names. The
parameter values need not be quoted, but the closing caret (`>`) character must
be escaped or avoided.

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

Each token/language construct has a semantic class associated with it. These 
are:

* text
* textblock
* hybrid
* block

This concept, like in HTML, defines reasonable defaults around nesting 
behaviour:

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

Any character which does not fit into the first 128 printable ASCII characters,
or is not permitted in XML will be escaped as XML/HTML hexadecimal entities.

Using Duckdown
==============

Duckdown may be run on the server or in the browser. Let's start with node.

Installing
--------------

If you're using `npm`, you may install Duckdown locally or globally. Installing
globally will permit you to easily use Duckdown's CLI tool.

	npm install -g duckdown
	
If you plan on running the tests or building Duckdown yourself, you should
install the development dependencies:

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
	interested, for example, in the tokens, log, or AST, you can surpress
	display of the compiled HTML.*
* **`-e`, `--echo`**
	*<br />Include raw duckdown in output*
* **`-b`, `--build`**
	*<br />Builds a combined JS file representing the Duckdown source, intended
	for use in the browser, in both minified and unminified forms. Development
	dependencies are required in order to use this option. You may specify a
	filename to write to - which will be considered the name of the 'minified'
	version. The unminified version will have '-unminified' appended to the
	name.*

Example usage:
	
	# Surpresses compiled output, but displays tokens and an AST verbosely
	duck -atvs myDuckdownDocument.dd
	
	# Build duckdown to the current folder
	duck -b ./duckdown.js


Using the Duckdown API
----------------------

Fundamentally, the Duckdown API is very simple. Depending on whether you're 
using it with node or in the browser, the method of instantiation will be 
different - but the subsequent use is the same across platforms.

Basically, you'll want to create a new instance of the Duckdown parser. In node,
you'll need to require it. In the browser, just include the compiled version of
Duckdown ([you can find the latest build at Github](https://raw.github.com/cgiffard/Duckdown/master/compiled/duckdown.js), or you can [build it yourself](#building-and-testing-duckdown).)

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
calls before them. You'll need to clear the parser object before compiling 
again:

	duckdown.clear();
	var myNewCompiledHTML = duckdown.compile(someOtherDocument);
	
### Using Feathers

The syntax of feathers [was described earlier](#feathers), but feathers must be
registered with Duckdown in order to be correctly parsed.

A feather is a non-blocking JavaScript function which accepts an object hash of
parameters defined by the Duckdown document being parsed, and returns a string
to insert into the document (on compilation) over the top of the feather token.

It receives a reference to the feather node itself, so it may mutate the node 
later, in an asynchronous callback - but it must be non-blocking or it will
totally destroy parsing and compilation performance.

Feathers are registered with Duckdown using the `Duckdown.registerFeather()`
method:
	
	var featherHandler = function(input,duckdown){
		return "abc123";
	};
	
	duckdown.registerFeather("myfeather",featherHandler,"text");

The first parameter of the registration function is the name by which you would 
access the feather from the Duckdown document itself (eg. `<myfeather>`.)

The second parameter is the function to handle the feather.

The third (optional) parameter describes the
[semantic level](#a-word-on-text-and-block-level-semantics) of the feather
result (since a feather could reasonably used inline with text, or as a block,
like a video or image gallery.) This is used to support nesting behaviour.

---

That's it! You're good to go.

How Duckdown works
------------------

Still here? OK - Here's a little more about what this does.

The above method hides a lot of complexity. Behind the scenes, a number of major 
functions are called, shown here in roughly sequential order:

* **[Duckdown.tokenise](#tokenisation)**<br />
	Turns the raw text into tokens dictated by the grammar
* **[Duckdown.parse](#parsing-process)**<br />
	Parses the tokens into an intermediary AST
	* **[Duckdown.parseToken](#token-parsing)**<br />
		Called by the Duckdown parser, this function is responsible for the 
		brunt of the work. It parses an individual token according to state 
		stored in the Duckdown parser object itself.
	* **Duckdown.completeParse**<br />
		Finalises a parse operation (Technically speaking, it restores pointers
		to the AST root, closing any open nodes.)
* **[Duckdown.compile](#compilation)**<br />
	Actually compiles the sourcecode. Recursively loops through the AST,
	and calls out to compilation handlers defined by the grammar where required.

### Tokenisation

The first stage in any parsing process is to extract a list of meaningful tokens 
from the input text.

The duckdown tokenising function is `Duckdown.tokenise()`.

Duckdown uses a two-condition process. It splits the input stream based on 
matches with tokens in the grammar, but also at the boundries of word and non-
word characters. Duckdown emphasises longer, more specific matches over more
generic ones.

It advances through the text one character at a time, and takes a section of 
characters between the current pointer and an index determined by the longest
token in the grammar.

It then checks the substring against each item in the grammar. If a match is 
found, it saves the result as a token, and advances the stream pointer to the 
one character after the end of the match.

If a match isn't found, the length of the substring is decreased by one
character, and is compared to the grammar again. This repeats until either a 
match is found, or the length of the string reaches just one character.

If the substring is only one character long and no grammar match has been found,
the character is classified according to whether it is a 'word' or 'non-word'
character. 'Runs' of word and non-word characters are buffered and each run is
converted into a token when the tokeniser state changes, or completes.

You may use the `duck` CLI took to observe the token buffer for the document -
see the [CLI](#cli) section for usage instructions.

### Parsing process

The parsing process is initiated by `Duckdown.parse()`.

It loops through each of the tokens made available by the tokenising stage, and
runs `Duckdown.parseToken()` (*see [Token Parsing](#token-parsing) below*) on
each of them in order to build an AST for the document/stream.

Once each token in the stream is parsed, it executes `Duckdown.completeParse`,
which ties up any loose ends, and restores any pointers that it had to nodes
deep in the parser AST to point to the root of the AST itself.

This means that input parsed later cannot mutate nodes already in the Duckdown
AST. If you need to leave the parser state as is, so you can add additional
content to the document later (for example, you're cumulatively processing a
stream,) - you can pass a `leaveHanging` attribute to `Duckdown.parse()`:

	// Duckdown.parse(input,leaveHanging);
	duckdown.parse(null,true);

#### Token Parsing

The `Duckdown.parseToken()` function is called for each token, and recursively
builds an AST from them. It is responsible for the bulk of the work Duckdown 
does.

Each time it is called, it observes the context it stores against the Duckdown
parser object itself, and evaluates the current token according to that state.

In order of execution, it first checks to see whether the current token
terminates any existing state, and recursively closes any open AST nodes if
applicable. At this point, it emits, for each closed node, any relevant events,
and mutates nodes depending on whether the grammar defines specific requirements
for them that are only evaluable upon termination.

If the current token hasn't been 'swallowed' by this process (used up when
terminating an AST node) then it will checked again against the grammar, to
determine if a new node should be created for it.

If a node is not created, the token is deemed to be 'text', and it is buffered.

If a node is created, any currently buffered tokens are appended to the previous
current node as 'children'. The new node is then also appended as a child, and
initialised.

The token pointer is then advanced by one, and the `parseToken` function is
called again as required, until the token buffer is exhausted.

You may use the `duck` CLI took to observe the final AST for the document -
see the [CLI](#cli) section for usage instructions.

### Compilation

Once an AST has been built, Duckdown can compile the document to HTML.

Duckdown recursively loops downward through the AST, compiling each node and
appending the result to a text buffer, which it then returns.

Text tokens are [encoded](#a-word-on-encoding) and appended as is. Duckdown 
nodes are compiled according to the rules defined in the grammar. If a node does 
not have a compilation rule associated with it in the grammar, Duckdown will 
simply descend into the node and compile its children.

If the node does define a compilation rule, that rule may determine whether
further descent occurs. Each compilation rule is passed a reference to the
Duckdown compiler, which it can use to compile child nodes, or simply ignore.

### Events

During the tokenising, parse, and compilation process, Duckdown emits a number
of events which you can listen to in order to introspect the parser operation.

Duckdown itself uses this to generate the parser event logs and performance
profile that you can see in the [`duck` CLI tool.](#cli).

Duckdown implements a kind of pseudo-EventEmitter (because this code also has to 
run in the browser, and bundling the complete EventEmitter class was overkill!)
which you can use like so:
	
	//  Listen to the parse token event
	duckdown.on("parsetoken",function handler(currentToken) {
		// do something
		console.log("Looks like the token '%s' is being parsed!",currentToken);
	});


Here's a list:

* **clear**<br />
	Emitted when initialising the Duckdown parser object, or when the Duckdown
	parser state is destroyed. No arguments.
	
* **tokenisestart**<br />
	Emitted when the tokenising process begins. No arguments.
	
* **tokeniseend**<br />
	Emitted when the tokenising process is completed. Hands a the resultant
	token list over as the first argument.
	
* **parsestart**<br />
	Emitted when the parsing process is initiated. No arguments.
	
* **parseend**<br />
	Emitted when the parsing process completes. No arguments.
	
* **parsetoken**<br />
	Emitted when Duckdown begins parsing a token. Passes the current token as
	the first argument.
	
* **compilestart**<br />
	Emitted when Duckdown begins compiling. No arguments.
	
* **compileend**<br />
	Emitted when Duckdown completes compilation. Passes the final HTML document
	as the first argument.
	
* **addstate**<br />
	Emitted when Duckdown adds another state to its internal state stack. The
	state name/ID in question is passed as the first argument.
	
* **nodeclosed**<br />
	Emitted when Duckdown closes an AST node. A reference to the node itself is
	passed as the first argument.
	
* **nodeinvalid**<br />
	Emitted when a static grammar rule, or processing function determines that a 
	node is invalid. The current node is passed as the first argument. If the
	node was determined to be invalid by a regex condition, the condition will
	be passed as the second argument, and the raw node source as the third.
	
* **nodeselfdestruct**<br />
	Emitted when a node processing function determines that the node is invalid
	and should be converted to text instead of remaining as a node. The node
	in question is passed as the first parameter.

Be aware that Duckdown doesn't try and clean up after you. If you throw an error 
or do something untoward in an event listener, you'll kill the current operation 
at hand.

Building and Testing Duckdown
-----------------------------

At the moment, Duckdown only needs to be built for the browser, as the raw
source form will work natively in node.

When installed globally, Duckdown makes available a `duck` CLI tool, which
you can use to build the source for the browser. (See [CLI](#cli) for details.)
The git repository also includes an up-to-date version of Duckdown built for the
browser, in both minified and unminified form. (/compiled/duckdown.js)

Duckdown uses mocha and chai to run its test suite. You can run the test suite
with npm:

	npm test
	
Or, with mocha itself for more flexibility

	# Show just the syntax tests with the spec reporter
	# - and watch for changes
	mocha -w -R spec -g reference

You can check the current build status at
[Travis CI](http://travis-ci.org/cgiffard/Duckdown).

Writing a Duckdown Grammar
--------------------------

The Duckdown Grammar, as it currently stands, exhausted the ability of its own
architecture/structure to keep it clean and organised.

It is currently in the midst of being totally refactored to ensure it is clean,
understandable, and maintainable.

When this process is complete, the new architecture will be documented. Sorry!

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