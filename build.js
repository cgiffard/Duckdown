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



var fs = require("fs"),
	PackageInfo = require("./package.json"),
	fileData = "";
	
function addComment(comment) {
	fileData += "// " + comment.replace(/\n/g,"\n// ") + "\n";
}

console.log("Building package %s",PackageInfo.name);

// Add copyright, name, description, and other information...
addComment(PackageInfo.name + " (" + PackageInfo.version + ")");
addComment(PackageInfo.description);
// Pull any email addresses out of the build script (don't want them harvested by bots!) and add the year
addComment(PackageInfo.author.replace(/\s*<[^>]+>/ig,"") + " " + ((new Date()).getYear() + 1900));
addComment("\n\nPackage built " + (new Date()) + "\n");


// Now we just plug in each of the build files.
PackageInfo.buildfiles.forEach(function(buildFile) {
	
	console.log("Reading buildfile %s...",buildFile);
	
	
});