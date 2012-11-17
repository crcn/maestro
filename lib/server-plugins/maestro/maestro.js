var structr = require("structr"),
outcome     = require("outcome"),
Group       = require("./group"),
_ = require("underscore");

module.exports = structr(Group, {

	/**
	 */

	"override __construct": function(options) {
		this._super(_.extend({ name: "root" }, options));
		this._synchronizer = options.sync;
	},


	/** 
	 * synchronizes the database
	 */

	"step startSync": function(next) {
		return this._synchronizer.start(next);
	}
});