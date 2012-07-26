// Tests to ensure grammar file is well formed...

var chai = require("chai");
chai.should();


describe("Duckdown language grammar",function() {
	
	it("should be able to be required",function() {
		var Grammar = require("../grammar.js");
		
		Grammar.should.be.ok;
		Grammar.should.be.an("object");
	});
	
	it("should define a class of word-characters",function() {
		var Grammar = require("../grammar.js");
		
		Grammar.should.have.property("wordCharacters");
		Grammar.wordCharacters.should.be.an.instanceof(RegExp);
		
	});
	
	it("should define a list of states",function() {
		var Grammar = require("../grammar.js");
		
		Grammar.should.have.property("stateList");
		Grammar.stateList.should.be.an("object");
	});
	
	it("should define a list of significant tokens",function() {
		var Grammar = require("../grammar.js");
		
		Grammar.should.have.property("tokenMappings");
		Grammar.tokenMappings.should.be.an("object");
	});
	
	describe("Token mappings",function() {
		
	});
	
});