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
		this._setGroups();
	},

	/**
	 * returns a group with an associated search query.
	 */

	"group": function(name, query) {
		return this._groups[name] || (this._groups[name] = new Group(name, query));
	},

	/** 
	 * synchronizes the database
	 */

	"step sync": function(callback) {
		var self = this;
		this._synchronizer.run(callback);
	},

	/**
	 */

	"createServer": function(options, callback) {
		throw new Error("TODO");
	},


	/**
	 * sets the initial groups
	 */


	"_setGroups": function() {
		this._groups = {};
		for(var groupName in this._options.groups) {
			this.group(groupName, this._options.groups[groupName]);
		}
	}
});