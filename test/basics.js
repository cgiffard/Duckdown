var chai = require("chai");
chai.should();


describe("Duckdown API Surface",function() {
	
	var surfaceMethods = [
		"clear",
		"tokenise",
		"parse",
		"compile",
		"parseToken"
	];
	
	
	it("should exist as a function after being required",function() {
		var Duckdown = require("../");
		
		Duckdown.should.be.a("function");
	});
	
	it("should define key methods",function() {
		var Duckdown = new (require("../"))();
		
		surfaceMethods.forEach(function(method) {
			Duckdown.should.have.property(method);
			Duckdown[method].should.be.a("function");
		});
	});
	
	it("should not define any other methods",function() {
		var Duckdown = new (require("../"))();
		
		
	});
	
});

describe("Parser state",function() {
	var Duckdown = new (require("../"))();
	
	it("should be able to be cleared",function() {
		
		Duckdown.characterIndex	= 100;
		Duckdown.parserStates	= ["STATE_1","STATE_2"];
		Duckdown.parserAST		= ["TOKEN1","TOKEN2"];
		Duckdown.tokenBuffer	= "abc123";
		Duckdown.tokens			= ["TOKEN1","TOKEN2"];
		
		Duckdown.clear();
		
		Duckdown.characterIndex.should.equal(0);
		Duckdown.parserStates.should.have.length(0);
		Duckdown.parserAST.should.have.length(0);
		Duckdown.tokenBuffer.should.equal("");
		Duckdown.tokens.should.have.length(0);
	});
	
});

describe("Tokenisation",function() {
	var Duckdown = new (require("../"))();
	
	it("should return a token array given a string of tokens",function() {
		
		// Empty token string check
		var emptyTokenisation = Duckdown.tokenise("");
		emptyTokenisation.should.be.an("array");
		emptyTokenisation.should.be.empty;
		
		// Simple tokenising check
		var simpleTokenisation = Duckdown.tokenise("*Bold Text*");
		simpleTokenisation.should.be.an("array");
		simpleTokenisation.should.have.length(1);
		
	})
	
});

describe("Parsing",function() {
	var Duckdown = new (require("../"))();
	
	it("should return an appropriate array AST structure",function() {
		
		// Empty compilation check
		Duckdown.parse("").should.be.an("array");
		Duckdown.parse("").should.be.empty;
		
		// Simple compilation check
		Duckdown.parse("*Bold Text*").should.be.an("array");
		Duckdown.parse("*Bold Text*").should.have.length(1);
		
	});
	
});