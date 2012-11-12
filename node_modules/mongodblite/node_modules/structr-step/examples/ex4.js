var structr = require("structr");

structr.mixin(require("../"));

var Test = structr({
	"step 1": function() {

	}
});



var t = new Test();


function sleep(next) {
	setTimeout(next, 500);
}

t.name = "t"

for(var i = 20; i--;)
t.step(


	function(next) {
		console.log("1");
		t.step(function(next) {

			t.step(function(next) {
					console.log("2");
					sleep(next);
			});

			sleep(next);
		});
		sleep(next);
	},

	function(next) {
		console.log("3");
		sleep(next);
	}
);



