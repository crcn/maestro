var step = require("step"),
outcome = require("outcome"),
_ = require("underscore"),
sprintf = require("sprintf");

exports.require = ["http.server", "maestro"];
exports.plugin = function(server, maestro) {


	var ServerModel = maestro.ServerModel;

	server.post("/servers/:server", function(req, res) {

		var on = outcome.error(function(err) {
			res.end(err.message);
		});

		step(
			function() {
				ServerModel.findOne({ _id: req.params("server") }, this);
			},
			on.success(function(server) {
				if(!server) return on(new Error("server doesn't exist"));
				logger.info(sprintf("updating server info for %s", server._id));
				_.extend(server, req.body);
				server.save();
			}),
			on.success(function() {
				res.end("OK");
			})
		);
	})
}