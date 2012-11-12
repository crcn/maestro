var structr = require("structr"),
_ = require("underscore"),
CommandChain = require("./chain");


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
		this._queryWatcher = options.queryWatcher;
		this._options = options;
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

		var chain = new CommandChain({ ServerModel: this._ServerModel, selectors: this._selectors, queryWatcher: this._queryWatcher }).query(_.extend({}, this.query, query)),
		self = this;

		return chain.step(function(next) {
			self.step(function(nx) {
				nx();
				next();
			});
		});
	}
	 
});