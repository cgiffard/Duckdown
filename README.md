Duckdown
========

Ultra-simple Markdown-inspired markup language.

Preliminary documentation.


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




Using Duckdown in the browser
-----------------------------



Building Duckdown
------------------



Writing a Duckdown Grammar
--------------------------
