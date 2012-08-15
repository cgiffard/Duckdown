Duckdown [![Build Status](https://secure.travis-ci.org/cgiffard/Duckdown.png)](http://travis-ci.org/cgiffard/Duckdown)
========

Ultra-simple Markdown-inspired markup language.

Preliminary documentation.

Writing with Duckdown
----------------------


Using Duckdown
==============


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
