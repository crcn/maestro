var structr = require("structr"),
aws         = require("aws-lib"),
outcome     = require("outcome"),
_ = require("underscore"),
dref = require("dref");

module.exports = structr({

	/**
	 */

	"__construct": function(params) {
		var self = this,
		_id = 0;

		this._servers = params.map(function(server) {

			return {
				_id: "local-server" + (_id++),
				ns: server.host,
				state: "running",
				service: self,
				image: {
					_id: "local-image" + (_id),
					name: server.type
				}
			}
		});

		this.name = "local";
	},

	/**
	 */

	"getAllServers": function(callback) {
		callback(null, this._servers);
	},

	/**
	 */

	"stopServer": function(server, callback) {
		callback();
	},

	/**
	 */

	"startServer": function(server, callback) {
		callback();
	},

	/**
	 */

	"rebootServer": function(server, callback) {
		callback();
	},

	/**
	 */

	"terminateServer": function(server, callback) {
		callback();
	},

	/**
	 */

	"step cloneServer": function(server, callback) {
		callback(new Error("unable to clone local server"));
	},

	/**
	 */

	"getServerInfo": function(server, callback) {
		callback(null, server.info);
	}
});

module.exports.serviceName = "local";