// Checks compilation of individial testfiles matches expectations

var chai	= require("chai"),
	fs		= require("fs");

// Init Chai object sugar
var expect = chai.expect;

describe("Syntax test",function() {
	
	var dirContents = fs.readdirSync("./test/syntax");
		
	var syntaxTests = dirContents.filter(function(item) {
			return item.match(/\.dd$/);
		})
		.map(function(item) {
			return item.replace(/\.dd$/,"");
		});
		
	syntaxTests.forEach(function(test) {
		it("'" + test + "' should match reference rendering",function(done) {
			
			fs.readFile("./test/syntax/" + test + ".dd",function(error,fileData) {
				if (error) throw error;
				
				var compiledData = "",
					Duckdown = new (require("../"))();
				
				Duckdown.parse(fileData.toString());
				compiledData = Duckdown.compile();
				
				fs.readFile("./test/syntax/" + test + ".html",function(error,referenceData) {
					if (error) throw error;
					
					referenceData = referenceData.toString();
					
					var referenceLines = referenceData.split(/\n/g);
					var compiledLines = compiledData.split(/\n/g);
					
					// Break this up line by line, so we get nicer errors...
					referenceLines.forEach(function(line,index) {
						expect(compiledLines[index]).to.equal(line);
					})
					
					expect(referenceData).to.equal(compiledData);
					
					done();
				});
			});
		});
	});
});