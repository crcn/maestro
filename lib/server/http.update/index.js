var step = require("step"),
outcome = require("outcome"),
_ = require("underscore"),
sprintf = require("sprintf").sprintf;

exports.require = ["plugin-express", "http.private", "maestro.core"];
exports.plugin = function(server, basicAuth, maestro) {


	var collection = maestro.collection;

	server.put("/servers/:server", basicAuth, function(req, res) {

		var on = outcome.error(function(err) {
			res.end(err.message);
		});


		console.log("http update server id=%s", req.param("server"));

		var server = collection.findOneSync({ _id: req.param("server") });

		if(!server) return on(new Error("server doesn't exist"));

		server.updateSync(req.body);

		res.end("OK!");
	})
}