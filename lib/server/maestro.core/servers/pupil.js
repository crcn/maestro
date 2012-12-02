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
		this._clientRequest("/hello", this.server.get(), callback);
	},

	/**
	 */

	"run": function(command, args, callback) {
		this._clientRequest("/run", { command: command, args: args }, callback);
	},

	/**
	 */

	"gateway": function() {

		var host = (this.server.get("ns") || this.server.get("gateway"));
		if(!host) return host;

		return "http://" + this.auth.user + ":" + this.auth.pass + "@" + host + ":" + this.port;
	},

	/**
	 */

	"_clientRequest": function(path, data, callback) {

		var host = this.gateway();
		if(!host) return callback(new Error("no host provided, cannot ping"));
		
		var ops = {
			url: host + path,
			json: data
		}, on = outcome.error(callback);


		request.post(ops, callback);
	}
});