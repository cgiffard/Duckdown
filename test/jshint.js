// Tests to ensure grammar file is well formed...

var chai = require("chai");
chai.should();

describe("Core code",function() {
	var JSHINT = require("jshint").JSHINT,
		fs = require("fs");
	
	it("should pass JSHint with no errors",function() {
		var coreCode = fs.readFileSync("index.js").toString();
		
		JSHINT(coreCode);
		JSHINT.errors.should.have.length(0);
	})
});

describe("Grammar definitions",function() {
	var JSHINT = require("jshint").JSHINT,
		fs = require("fs");

	it("should pass JSHint with no errors",function() {
		var coreCode = fs.readFileSync("grammar.js").toString();

		JSHINT(coreCode);
		JSHINT.errors.should.have.length(0);
	})
});

describe("Duckdown Node class",function() {
	var JSHINT = require("jshint").JSHINT,
		fs = require("fs");

	it("should pass JSHint with no errors",function() {
		var coreCode = fs.readFileSync("ducknode.js").toString();

		JSHINT(coreCode);
		JSHINT.errors.should.have.length(0);
	})
});