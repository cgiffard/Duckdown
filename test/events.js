var chai = require("chai"),
	expect = chai.expect;
	chai.should();

// Events to be tested...
var events = [
	"clear",
	"tokenisestart",
	"tokeniseend",
	"parsestart",
	"parseend",
	"parsetoken",
	"compilestart",
	"compileend",
	"addstate",
	"nodeclosed",
	"nodeinvalid",
	"nodeselfdestruct"
];

describe("Parser Events",function() {

	describe("when a relevant event occurs",function() {
		var Duckdown = new (require("../"))();
		var eventHandlerCallCheck = {};
		
		events.forEach(function(eventName) {
			Duckdown.on(eventName,(function(evt) {
				return function Handler() {
					// Register that the event handler has been called.
					eventHandlerCallCheck[evt] = eventHandlerCallCheck[evt] ? eventHandlerCallCheck[evt] + 1 : 1;
				};
			})(eventName));
		});
		
		// Initialise clear event...
		Duckdown.clear();
		
		// Chunk some tokens...
		Duckdown.tokenise("Here's a set of duckdown tokens. Here's a <feather, which should be invalid.>\nHere's an h1. that should selfdestruct.\n");
		
		// Parse them...
		Duckdown.parse();
		
		// Compile to HTML...
		Duckdown.compile();
		
		events.forEach(function(eventName) {
			it("should call event handlers for " + eventName + " ",function() {
				expect(eventHandlerCallCheck[eventName]).to.satisfy(function(inVal) { return inVal && inVal > 0 });
			})
		});
	});

	it("should reject event handler registrations which don't meet requirements",function() {
		var Duckdown = new (require("../"))();
		
		function registerBadFeatherName() {
			Duckdown.on(null,function() {});
			Duckdown.on("abc &#@$ 1234",function() {});
		}
		
		expect(registerBadFeatherName).to.throw(Error);
		
		function registerBadFeatherHandler() {
			Duckdown.on("clear",null);
			Duckdown.on("clear",{});
		}
		
		expect(registerBadFeatherHandler).to.throw(Error);
	});
});