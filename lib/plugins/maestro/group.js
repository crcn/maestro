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

	"getServer": function(query, options, callback) {

		if(arguments.length == 2) {
			callback = options;
			options = {};
		}

		return this.getServers(query).options(select).exec(callback);
	},

	/**
	 */


	"getAllServers": function(callback) {
		return this.getServers({ _id: {$ne:null}}, callback);
	},

	/**
	 */

	"getServers": function(query, callback) {

		if(typeof query == "function") {
			callback = query;
			query = undefined;
		}

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