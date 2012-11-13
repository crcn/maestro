var structr = require("structr"),
Group = require("./group"),
_ = require("underscore");


module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this._options = options;
	},

	/**
	 */

	"getZone": function(query) {
		return this.getZones(query);
	},

	/**
	 */

	"getAllZones": function() {
		return this.getZones();
	},

	/**
	 */


	"getZones": function(query) {

		//query = { service: query, zone: "ec3"}

		var ops = {
			query: query || {},
			zones: this
		};

		return new Group(_.defaults(ops, this._options));
	},

});