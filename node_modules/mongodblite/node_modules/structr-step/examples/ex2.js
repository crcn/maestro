var structr = require("structr");

structr.mixin(require("../"));

var Test = structr({
	"step lv1": function(){}
});


function sleep(next) {
	setTimeout(next, 500);
}


var to = new Test();
to.step(
	function(next) {
		console.log("1");
		to.step(function(next) {
			console.log("2");
			to.step(function(next) {
				console.log("3");
				sleep(next);
			},
			function(next) {
				console.log("4");
				sleep(next);
			}).
			step(next);
		},
		function(next) {
			console.log("5");
			sleep(next);
		}).
		step(next);
	},
	function(next) {
		console.log("6");
		sleep(next);
	},
	function(next) {
		console.log("7")
		sleep(next);
	})