var step = require("step"),
outcome = require("outcome"),
_ = require("underscore"),
sprintf = require("sprintf").sprintf,
logger = require("winston").loggers.get("http.update");

exports.require = ["http.server", "http.private", "maestro"];
exports.plugin = function(server, basicAuth, maestro) {


	var ServerModel = maestro._ServerModel;

	server.put("/servers/:server", basicAuth, function(req, res) {

		var on = outcome.error(function(err) {
			res.end(err.message);
		});

		logger.info(sprintf("http update server id=%s", req.param("server")));

		step(
			function() {
				ServerModel.findOne({ _id: req.param("server") }, this);
			},
			on.success(function(server) {
				if(!server) return on(new Error("server doesn't exist"));
				logger.info(sprintf("updating server info for %s", server._id));
				_.extend(server, req.body);
				server.save(this);
			}),
			on.success(function() {
				res.end("OK");
			})
		);
	})
}