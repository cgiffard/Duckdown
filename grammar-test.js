var DuckdownGrammar = require("./grammar");
console.log(DuckdownGrammar);

for (var item in DuckdownGrammar.genus) {
	console.log("\n\n"+item);
	
	if (typeof DuckdownGrammar.genus[item] === "object") {
		var propList = [];
		
		console.log("--methods--");
		for (var method in DuckdownGrammar.genus[item]) {
			
			if (DuckdownGrammar.genus[item][method] instanceof Function) {
				if (DuckdownGrammar.genus[item].hasOwnProperty(method)) {
					console.log("\t* "+method);
				} else {
					console.log("\t  "+method);
				}
				
			} else {
				propList.push(method);
			}
		}
		
		console.log("--properties--");
		propList.forEach(function(property) {
			console.log("\t  "+property);
		})
	}
	
}