#!/usr/bin/env node

var fs = require("fs");

console.log("Duckdown Test Suite.");

fs.readdir("./tests",function(error,directoryContent) {
	if (error) {
		console.log("Couldn't read tests.");
		throw error;
	}
	
	directoryContent.forEach(function() {
		
	});
});
