var structr = require("structr"),
sprintf = require("sprintf").sprintf,
_ = require("underscore");


var sort = {
	roundRobin: function(servers) {
		return servers.sort(function(a, b) {
			return a.get("lastSelectedAt").getTime() > b.get("lastSelectedAt").getTime() ? 1 : -1;
		})
	},
	leastConn: function(servers) {
		return servers.sort(function(a, b) {
			return a.get("numConnections") > b.get("numConnections") ? 1 : -1;
		})
	}
}

module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this._sort = sort[options.algorithm];
		if(!this._sort) {
			throw new Error(sprintf("algorithm %s doesn't exist", options.algorithm));
		}
	},

	/**
	 */

	"sort": function(servers, callback) {
		return callback(null, this._sort(servers));
	}
});

module.exports.test = function(select) {
	return !!select.algorithm;
}