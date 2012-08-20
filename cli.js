#!/usr/bin/env node

/*globals require:true, process:true, console:true, __dirname:true*/

(function() {
	
	var Duckdown	= require("./"),
		PackageInfo	= require("./package.json"),
		fs			= require("fs"),
		duck		= require("commander"),
		duckdown	= null,
		filename	= null,
		fileData	= null,
		stdin		= process.stdin,
		logStore	= [];
	
	// Thanks, commander!
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
			buildFile	= __dirname + "/compiled/duckdown-unminified.js",
			minFilename	= __dirname + "/compiled/duckdown.js";
		
		if (duck.args.length) {
			buildFile = duck.args[0].replace(/\.js$/,"");
			minFilename = filename + ".js";
			filename = filename + "-unminified.js";
		}
		
		console.log("Building minified version to: %s",minFilename);
		console.log("Building unminified version to: %s",buildFile);
		
		// Run the build...
		build(buildFile,false);
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
	
	// Log Duckdown parse events
	if (duck.log) {
		// Attach our events for generating a log...
		[	"clear",
			"tokenisestart",
			"tokeniseend",
			"parsestart",
			"parseend",
			"parsetoken",
			"addstate",
			"nodeclosed",
			"nodeinvalid",
			"nodeselfdestruct",
			"compilestart",
			"compileend"
			].forEach(function(eventName) {
				// Generate a curry function to parse the event name through as the first argument
				duckdown.on(eventName,(function(name) {
					return function EventListener() {
						var args = arguments;
						duckLog.apply(duckdown,[name].concat([].slice.call(args,0)));
					};
				})(eventName));
			});
	}
	
	// And a function for receiving the events in question!
	function duckLog(eventName) {
		var args = [].slice.call(arguments,1), self = this;
		
		function log() {
			var logTime = Date.now(),
				startTime = logTime;
			
			if (logStore.length) {
				startTime = logStore[0].time;
			}
			
			logStore.push({
				"time": logTime,
				"data": [].slice.call(arguments,0)
			});
			
			console.log.apply(console,["+" + (logTime-startTime) + "ms\t"].concat([].slice.call(arguments,0)));
		}
		
		switch (eventName) {
			
			case "clear":
				log("Duckdown object cleared; state reinitialised.");
				break;
			
			case "tokenisestart":
				log("Beginning tokenising procedure.");
				break;
			
			case "tokeniseend":
				log("Completed tokenising. " + self.tokens.length + " tokens found.");
				break;
			
			case "parsestart":
				log("Beginning parsing.");
				break;
			
			case "parseend":
				log("Completed parsing");
				break;
			
			case "parsetoken":
				log("Parsing token '" + args[0].replace(/\n/ig,"\\n") + "'");
				
				if (duck.verbose) {
					log("State list: " + self.parserStates.join(","));
					log("Last token whitespace?",self.whitespace);
				}
				
				break;
			
			case "addstate":
				log("Added the state " + args[0] + " to the state stack.");
				if (duck.verbose) log("State list: " + self.parserStates.join(","));
				break;
			
			case "nodeclosed":
				log("Node closed: " + args[0].state);
				break;
			
			case "nodeselfdestruct":
				log("Node self-destructed: " + args[0].state);
				break;
				
			case "nodeinvalid":
				log("Node was marked as invalid: " + args[0].raw());
				break;
			
			case "compilestart":
				log("Starting compilation.");
				break;
				
			case "compileend":
				log("Completed compilation with " + args[0].length + " single-byte-characters of compiled HTML.");
				break;
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
		};
		var indent = new Indent();
		
		// Ensure we're dealing with some kind of array here
		if (!(astList instanceof Array)) throw new Error("AST list provided was not an array!");
		
		if (!depth) console.log("\nAST ROOT");
		
		// Now loop through!
		astList.forEach(function(node,count) {
			var widget = (depth === 0 && count === 0 ? "\u250f  " : (count < astList.length-1 ? "\u2523  " : "\u2517  "));
			var pre = indent + widget;
			// var pretoken = indent + 
			if (typeof node === "object") {
				var sibling = "";
				
				if (node.previousSibling !== null && duck.verbose) {
					if (typeof node.previousSibling === "string") {
						sibling = " ::NODE_TEXT";
					} else {
						sibling = " ::" + node.previousSibling.state;
					}
				}
				
				var info = "";
				
				// Print flags in verbose mode...
				if (duck.verbose) {
					for (var nodeFlag in node) {
						if (node.hasOwnProperty(nodeFlag) &&
							(
								typeof node[nodeFlag] === "boolean"||
								typeof node[nodeFlag] === "string" ||
								typeof node[nodeFlag] === "number" )) {
							
							if (!!node[nodeFlag]) {
								// Indent and get ready for printing token...
								info += depth > 0 ? "\n" + indent + "\u250a" : "\n" + indent + "\u250a";
								info += "   ";
							}
							
							if (!!node[nodeFlag] && typeof node[nodeFlag] === "boolean")
								info += "[" + nodeFlag + "]";
								
							if (!!node[nodeFlag] && typeof node[nodeFlag] !== "boolean")
								info += "[" + nodeFlag + ":" + String(node[nodeFlag]).replace(/\n/ig,"\\n") + "]";
						}
					}
				}
				
				console.log(pre + node + sibling + info);
				
				outputAST(node.children,depth+1);
			} else {
				console.log(pre + "\"" + node + "\"");
			}
		});
		
		if (!depth) console.log("______\n");
	}
})();