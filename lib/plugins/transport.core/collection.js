var structr = require("structr"),
async       = require("async"),
outcome = require("outcome"),
logger = require("winston").loggers.get("transports.core.collection"),
sprintf = require("sprintf").sprintf;

module.exports = structr({
	"__construct": function(transports) {
		this._transports = transports;
	},

	/**
	 */

	"getAllServers": function(callback) {
		async.map(this._transports, function(transport, next) {
			logger.info(sprintf("fetching servers from %s", transport.name));
			transport.getAllServers(next);
		}, outcome.error(callback).success(function(servers) {
			callback(null, Array.prototype.concat.apply([], servers));
		}));
	}
});