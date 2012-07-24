var chai = require("chai"),
	expect = chai.expect;
	chai.should();


describe("Feathers API",function() {
	
	it("should enable registration of a feather function",function() {
		var Duckdown = new (require("../"))();
		var featherName = "abc123"

		Duckdown.registerFeather(featherName,function(arg1,arg2) {
			// Ordinarily, the feather would return HTML output.
			return featherName;
		});
		
		Duckdown.feathers[featherName].should.be.a.function;
	});
	
	describe("should reject poor feather registrations",function() {
		var Duckdown = new (require("../"))();
		
		it("should reject invalid feather names",function() {
			
			(function() { Duckdown.registerFeather("@#&$*--"); }).should.throw(Error);
		});
		
		it("should reject duplicate feathers",function() {
			
			Duckdown.registerFeather("abc123",function() {});
			
			(function() { Duckdown.registerFeather("abc123",function() {}); }).should.throw(Error);
		});
		
		it("should reject feathers without functions",function() {
			
			(function() { Duckdown.registerFeather("testing123"); }).should.throw(Error);
			
		});
		
	});
	
	it("should enable unregistration of feather functions",function() {
		var Duckdown = new (require("../"))();
		
		Duckdown.registerFeather("testing123",function(){});
		Duckdown.unregisterFeather("testing123");
		
		expect(Duckdown.feathers["testing123"]).to.be.undefined;
		
	});
	
	it("should require feathers to exist before deleting them",function() {
		var Duckdown = new (require("../"))();
		
		(function() { Duckdown.unregisterFeather("testing123"); }).should.throw(Error);
		
	});
	
	it("should call registered feather function when parsing text containing a matching feather token",function() {
		var Duckdown = new (require("../"))();
		var FeatherCalled = false;
		
		Duckdown.registerFeather("testingfeather",function(){
			FeatherCalled = true;
		});
		
		Duckdown.parse("<testingfeather a:123 b:321 c:231>");
		
		FeatherCalled.should.be.true;
	});
	
	it("should include output from feather function when parsing",function() {
		var Duckdown = new (require("../"))();
		
		Duckdown.registerFeather("testingfeather",function(){
			return "abc123";
		});
		
		Duckdown.parse("<testingfeather>");
		var parseResult = Duckdown.compile();
		
		expect(parseResult).to.match(/abc123/g);
	});
	
	it("should pass compile-time parameters to the feather function as an object/map",function() {
		var Duckdown = new (require("../"))();
		var parametersCorrect = false;
		
		Duckdown.registerFeather("testingfeather",function(input){
			if (input && input.a === "123" && input.b === "321" && input.c === "231") {
				parametersCorrect = true;
			}
		});
		
		Duckdown.parse("<testingfeather a:123 b:321 c:231>");
		
		parametersCorrect.should.be.true;
	});
	
	it("should deal neatly with spaces when parsing parameters",function() {
		var Duckdown = new (require("../"))();
		var parametersCorrect = false;
		
		Duckdown.registerFeather("testingfeather",function(input){
			if (input && input.a === "123 123 123 123" && input.b === "321 321 321 321" && input.c === "231 231 231 231") {
				parametersCorrect = true;
			}
		});
		
		Duckdown.parse("<testingfeather a:123 123 123 123 b:321 321 321 321 c:231 231 231 231>");
		
		parametersCorrect.should.be.true;
	});
});