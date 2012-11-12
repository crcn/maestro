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
		this.ServerModel = options.ServerModel;
		this.name = options.name;
		this.query = options.query;
		this.selectors = options.selectors;
		this.queryWatcher = options.queryWatcher;
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

		var chain = new CommandChain({ ServerModel: this.ServerModel, selectors: this.selectors, queryWatcher: this.queryWatcher }).query(_.extend({}, this.query, query)),
		self = this;

		return chain.step(function(next) {
			self.step(next);
		}).find(callback);
	}
	 
});