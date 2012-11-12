var structr = require("structr"),
tq = require("tq");

structr.mixin(require("../"));

var Test = structr({
	"step lv1": function(next) {
		// console.log(next.stepper)
		/*this.step(function(next) {
			console.log("lv1");
			// this.timeout(500, next);
			setTimeout(next, 500)
		}).step(next);*/
		console.log("lv1");
		var self = this;
		this.timeout(500, function() {
			
		}).
		step(next);
	},
	"step lv2": function(next) {

		this.step(function(next) {
			this.lv3(next);
		}).step(function(next) {
			console.log("lv2");
			this.timeout(500, next);
		}).
		step(next);
		
	},
	"step lv3": function(next) {
		
		this.step(function(next) {
			console.log("lv3");
			this.timeout(500, next);
		}).
		step(next);
	},
	"step timeout": function(time, next) {
		setTimeout(next, time);
	}
});

var t = new Test();


/*setInterval(function() {
	t.lv1(function(next) {
		// next();
	});
}, 100);*/


t.lv1(function() {
	console.log("DONE")
});
