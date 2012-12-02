var structr = require("structr"),
outcome     = require("outcome"),
Group       = require("./group"),
_           = require("underscore"),
states      = require("./servers/states"),
ServerChain = require("./chains/server");

module.exports = structr(Group, {

	/**
	 */

	"override __construct": function(options) {

		this._super({ name: "root" });

		this.collection    = options.collection;
		this.selectors     = options.selectors;
		this.services      = options.services;
		this.states        = states;
		this.ServerChain   = ServerChain; 

		this._synchronizer = options.sync;
	},

	/** 
	 * synchronizes the database
	 */

	"step sync": function(next) {
		return this._synchronizer.start(next);
	}
});