var structr = require("structr"),
_ = require("underscore"),
ServerChain = require("./serverChain"),
seq = require("seq"),
outcome = require("outcome");


/**
 * groups together servers based on the query given
 */


module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this.name = options.name;
		this.query = options.query || {};
		this._ServerModel = options.ServerModel;
		this._selectors = options.selectors;
		this._services = options.services;
		this._queryWatcher = options.queryWatcher;
		this._options = options;
		this._groups = {};
	},

	/**
	 */

	"groups": function(name, query) {
		return this._groups[name] || (new module.exports(_.defaults({
			name: name,
			query: query
		}, this._groups)));
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

		return new ServerChain({ ServerModel: this._ServerModel, selectors: this._selectors, queryWatcher: this._queryWatcher, group: this }).query(_.extend({}, this.query, query));
	}
	 
});