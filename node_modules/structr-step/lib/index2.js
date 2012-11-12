var tq = require("tq"),
gqueue = tq.queue().start(),
stepping = false;


function step(fn) {

	if(stepping) {
		gqueue = tq.queue().start();
		stepping = false;
	}
	var cqueue = gqueue;


	cqueue.push(function() {
		var next = this;
		stepping = true;
		fn(next);
		stepping = false;
	})

}

function sleep(next) {
	setTimeout(next, 500);
}

step(function(next) {



	step(function(next) {
		console.log("1");
		sleep(function() {

			step(function(next) {
				console.log("2");
				// next();
				// sleep(next);
			});

			next();
		});
	});

	step(function(next) {
		console.log("3");
		sleep(next);
	});

	next();

})

