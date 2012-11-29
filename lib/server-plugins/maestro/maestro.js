var structr = require("structr"),
outcome     = require("outcome"),
Group       = require("./group"),
_ = require("underscore");

module.exports = structr(Group, {

	/**
	 */

	"override __construct": function(options) {

		this._super({ name: "root" });

		this.collection    = options.collection;
		this.selectors     = options.selectors;
		this.states = require("./servers/states");

		this._synchronizer = options.sync;
	},

	/** 
	 * synchronizes the database
	 */

	"step sync": function(next) {
		return this._synchronizer.start(next);
	}
});