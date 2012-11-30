var structr = require("structr"),
step = require("step"),
request = require("request"),
outcome = require("outcome");

module.exports = structr({

	/**
	 */

	"__construct": function(ops, server) {
		this.port = ops.port;
		this.auth = ops.auth;
		this.server = server;

	},

	/**
	 */

	"ping": function(callback) {
		var host = this.gateway();
		if(!host) return callback(new Error("no host provided, cannot ping"));


		var ops = {
			url: host + "/hello",
			json: this.server.get()
		}, on = outcome.error(callback);


		step(
			function() {
				request.post(ops, this);
			},
			on.success(function(response, body) {
				this();
			}),
			callback || function() { }
		);
	},

	/**
	 */

	"gateway": function() {

		var host = (this.server.get("ns") || this.server.get("gateway"));
		if(!host) return host;

		return "http://" + this.auth.user + ":" + this.auth.pass + "@" + host + ":" + this.port;
	}
});