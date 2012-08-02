#!/usr/bin/env node

// An ultra-simple build script for Duckdown.
//
// Why am I doing it like this?
//
// I tried browserify and requirejs. Both of them are very impressive projects
// and I really wanted to use one of them. Ultimately though, Duckdown was not
// written in a particularly node-specific way, and didn't need the overhead
// of either in order to run properly. Browserify added quite a lot of boiler-
// -plate to the compiled script, and prevented me from easily creating global
// variables in the browser.
//
// Duckdown isn't a node-specific project being ported to the browser - it was
// designed to run in the browser right from the get-go. With that in mind,
// writing a really little custom build-script made a lot more sense.

(function(glob) {

	var fs				= require("fs"),
		uglifyParser	= require("uglify-js").parser,
		uglifyProcessor	= require("uglify-js").uglify,
		PackageInfo		= require("../package.json");
	
	function getBuildData() {
		// Now we just plug in each of the build files.
		var buildData = "";
		PackageInfo.buildFiles.forEach(function(buildFile) {
			var jsFile = "";
			
			try {
				jsFile = fs.readFileSync(__dirname + "/../" + buildFile);
			} catch(e) {
				console.error("Unable to read buildfile %s. Aborting...",buildFile);
				process.exit(1);
			}
			
			buildData += "\n\n" + jsFile.toString("utf8");
			
		});
		
		return buildData;
	}
	
	function generateCommentBlock() {
		var comments = "";
		
		function addComment(comment) {
			comments += "// " + comment.replace(/\n/g,"\n// ") + "\n";
		}
		
		// Add copyright, name, description, and other information...
		// Pull any email addresses out of the build script (don't want them harvested by bots!) and add the year
		addComment(PackageInfo.name + " (" + PackageInfo.version + ")");
		addComment(PackageInfo.description);
		addComment(PackageInfo.author.replace(/\s*<[^>]+>/ig,"") + " " + ((new Date()).getYear() + 1900));
		addComment("\n\nPackage built " + (new Date()) + "\n");
		
		return comments + "\n\n";
	}
	
	function getRequireData() {
		return fs.readFileSync(__dirname + "/require.js").toString("utf8");
	}
	
	function wrapData(inData) {
		requireShim = getRequireData();
		
		// return "(function(glob) {\n" + requireShim + "\n\n" + inData + "\n\n})(this);";
		return inData;
	}
	
	function minify(inData) {
		var ast = uglifyParser.parse(inData);
			ast = uglifyProcessor.ast_mangle(ast);
			ast = uglifyProcessor.ast_squeeze(ast);
		
		// Now we get our code out!
		return uglifyProcessor.gen_code(ast);
	}
	
	function build(outfile,minified) {
		var fileData	= ""
			comments	= "";
		
		comments = generateCommentBlock();
		fileData = wrapData(getBuildData());
		
		if (!minified) {
			
			// We write out the unminified version.
			console.log("Writing unminified script... (%d bytes)",(comments+fileData).length);
			fs.writeFileSync(outfile,comments + fileData);
		
		} else {
			console.log("Minifying...");
			fileData = minify(fileData);
			
			console.log("Writing minified script... (%d bytes)",(comments+fileData).length);
			fs.writeFileSync(outfile,comments + fileData);
		}	
	}
	
	module.exports = build;
	
})(this);