#!/usr/bin/env node

var Duckdown	= require("./"),
	PackageInfo	= require("./package.json"),
	fs			= require("fs"),
	duck		= require("commander"),
	duckdown	= null,
	filename	= null,
	filedata	= 
	stdin		= process.stdin;

// Thanks, commander!
duck
	.version(PackageInfo.version)
	.option("-t, --tokens","Output tokens")
	.option("-a, --ast","Show parse/AST tree")
	.option("-v, --verbose","Verbose output")
	.option("-s, --surpress","Surpress compiled output")
	.option("-e, --echo","Include raw duckdown in output")
	.option("-b, --build","Build duckdown for the browser")
	.parse(process.argv);

// Initialise Duckdown
if (Duckdown) {
	duckdown = new Duckdown();
} else {
	throw new Error("Failed to initialise Duckdown. Run the testfile!");
}

// Get Duckdown data... whether from file or STDIN
if (duck.args.length > 1) {
	console.warn("Warning: For the moment, the Duck CLI only deals with one file at a time.");
}

if (duck.build) {
	console.log("Building Duckdown for the browser.");
	
	var build		= require(__dirname + "/builder/build.js"),
		filename	= __dirname + "/compiled/duckdown-unminified.js",
		minFilename	= __dirname + "/compiled/duckdown.js";
	
	if (duck.args.length) {
		filename = duck.args[0].replace(/\.js$/,"");
		minFilename = filename + ".js";
		filename = filename + "-unminified.js";
	}
	
	console.log("Building minified version to: %s",minFilename);
	console.log("Building unminified version to: %s",filename);
	
	// Run the build...
	build(filename,false);
	build(minFilename,true);
	
	process.exit(0);
	
} else {
	
	// Check to see if we were given a file...
	filename = duck.args.pop();
	if (filename && filename.length > 0) {
		fs.readFile(filename,function(error,fileData) {
			if (error) throw error;
			
			// Well we got this far...
			parseDuckdown(fileData.toString());
			process.exit(0);
		});
		
	// Nope. Wait for some data from STDIN
	} else {
		var stdinBuffer = "";
		stdin.resume();
		stdin
			.on("data",function(chunk){
				stdinBuffer += chunk.toString();
			})
			.on("end",function(){
				parseDuckdown(stdinBuffer);
				process.exit(0);
			});
	}
}



// Here's where we actually do our work.
function parseDuckdown(duckinput) {
	if (duck.echo) console.log(duckinput + "\n\n");
	
	duckdown.tokenise(duckinput);
	
	if (duck.tokens) console.log(duckdown.tokens);
	
	duckdown.parse();
	
	if (duck.ast) outputAST(duckdown.parserAST);
	
	if (!duck.surpress) console.log(duckdown.compile());
}


function outputAST(astList,depth) {
	// Ensure we've got a number and not undefined
	depth = depth || 0;
	
	// Sugar for indentation
	function Indent() {}
	Indent.prototype.toString = function() {
		var indentBuffer = "";
		while (indentBuffer.length < depth*2) indentBuffer += "\u250a\t";
		return indentBuffer;
	}
	var indent = new Indent();
	
	// Ensure we're dealing with some kind of array here
	if (!(astList instanceof Array)) throw Error("AST list provided was not an array!");
	
	if (!depth) console.log("\nAST ROOT");
	
	// Now loop through!
	astList.forEach(function(node,count) {
		var widget = (depth === 0 && count === 0 ? "\u250f  " : (count < astList.length-1 ? "\u2523  " : "\u2517  "));
		var pre = indent + widget;
		if (typeof node === "object") {
			var sibling = "";
			
			if (node.previousSibling !== null && duck.verbose) {
				if (typeof node.previousSibling === "string") {
					sibling = " ::NODE_TEXT";
				} else {
					sibling = " ::" + node.previousSibling.state;
				}
			}
			
			console.log(pre + node + sibling);
			
			outputAST(node.children,depth+1);
		} else {
			console.log(pre + "\"" + node + "\"");
		}
	});
	
	if (!depth) console.log("______\n");
}