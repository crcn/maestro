var _ = require("underscore");

exports.require = ["pupil.core", "programs"];
exports.plugin = function(pupil, programs) {

	var nc = programs.proxy.numConnections,
	count = 0,
	secs = 0,
	avg = 0,
	oldAvg = 0;

	programs.proxy.on("connection", function() {
		count++;
	});

	setInterval(function() {

		secs++;

		avg = count / secs;

		if(secs > 10) {
			secs = 0;
			count = 0;
		}

		if(oldAvg == avg) return;

		console.log(avg)

		oldAvg = avg;

		pupil.update({ numConnections: programs.proxy.numConnections, connectionsPerSecond: avg });

		
	}, 1000);
}