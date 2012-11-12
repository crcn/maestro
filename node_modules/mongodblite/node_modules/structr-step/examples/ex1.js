var structr = require("structr");

structr.mixin(require("../"));

var Timeout = structr({
	"step timeout": function(time, index, next) {
		setTimeout(function() {
			next(index);
		}, time);
	},
	"step timeout2": function(time, index, next) {
		this.timeout(time, index).
		timeout(time, index).
		timeout(time, index).
		timeout3(time, index).
		timeout(time, index).
		step(function(next) {
			console.log("STEP 1");
			next("hello");
		},
		function(message, next) {
			console.log("STEP 2 %s", message)
			setTimeout(next, 100);
		}).
		timeout(time, index, next);
	},
	"step timeout3": function(time, index, next) {
		this.timeout(time, index, next);
	}
});



var to = new Timeout();

for(var i = 0; i < 100; i++)
to.timeout2(i*2, i, function(index) {
	console.log("TIMEOUT %d", index);
})