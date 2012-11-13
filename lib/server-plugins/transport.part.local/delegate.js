var structr = require("structr");

module.exports = structr({

	/**
	 */

	"__construct": function(instances) {
		this._instances = instances;
	},

	/**
	 */

	"getAllServers": function(callback) {
		callback(null, this._instances.map(function(host) {
			return {
				_id: host,
				ns: host
			};
		}));
	}
});