var structr = require("structr"),
async       = require("async"),
outcome = require("outcome"),
logger = require("winston").loggers.get("transports.core.collection"),
sprintf = require("sprintf").sprintf,
_ = require("underscore"),
sift = require("sift");

module.exports = structr({
	"__construct": function(transports) {
		this._transports = transports;
	},

	/**
	 */

	"getAllServers": function(callback) {
		async.map(this._transports, function(transport, next) {
			logger.info(sprintf("fetching servers from %s", transport.name));
			transport.getAllServers(function(err, servers) {
				if(!servers) return next(err);

				servers.forEach(function(server) {
					server.service = transport;
				});

				next(null, servers);
			});
		}, outcome.error(callback).success(function(servers) {
			callback(null, Array.prototype.concat.apply([], servers));
		}));
	},

	/**
	 */

	"source": function() {
		return this._transports;
	},


	/**
	 */

	"getService": function(name) {
		return _.find(this._transports, function(transport) {
			return transport.name == name;
		})
	},

	/**
	 * TODO
	 */

	"find": function(query, next) {
		return next(null, this._transports);
	}
});