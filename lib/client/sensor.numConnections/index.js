var _ = require("underscore");

exports.require = ["pupil.core", "programs"];
exports.plugin = function(pupil, programs) {

	var nc = programs.numConnections;

	setInterval(function() {
		var nc2 = programs.numConnections;

		if(nc == nc2) return;

		pupil.update({ numConnections: nc = nc2 });
	}, 1000);
}