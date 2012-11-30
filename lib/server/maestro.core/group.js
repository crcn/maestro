var structr = require("structr"),
_ = require("underscore"),
ServerChain = require("./serverChain"),
seq = require("seq"),
outcome = require("outcome");


/**
 * groups together servers based on the query given
 */


var Group = module.exports = structr({

	/**
	 */

	"__construct": function(options) {

		//the name of this group
		this.name = options.name;

		this._parent = options.parent;

		//the query to combine with any sub-groups
		this.query = options.query || {};

	},

	/**
	 * returns the root group (maestro)
	 */

	"root": function() {
		var cp = this;
		while(cp._parent) {
			cp = cp._parent;
		}
		return cp;
	},

	/**
	 */

	"parent": function() {
		return this._parent;
	},

	/**
	 */

	"groups": function(name, query) {
		return this._groups[name] || (this._groups[name] = new Group({ name: name, query: query, parent: this}));
	},

	/**
	 */

	"getServer": function(query) {
		return this.getServers(query).one();
	},

	/**
	 */


	"getAllServers": function() {
		return this.getServers({ _id: {$ne:null}});
	},

	/**
	 */

	"getServers": function(query) {

		if(typeof query == "function") {
			callback = query;
			query = undefined;
		}

		if(!query) query = {};

		return new ServerChain(this).query(_.extend({}, this.query, query));
	}
	 
});