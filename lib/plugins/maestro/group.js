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
	},

	/**
	 */

	"step getServer": function(query, options, callback) {

		if(arguments.length == 2) {
			callback = options;
			options = {};
		}

		return this.getServers(query).options(select).exec(callback);
	},

	/**
	 */

	"step getServers": function(query, callback) {

		if(typeof query == "function") {
			callback = query;
			query = undefined;
		}

		return new CommandChain({ ServerModel: this.ServerModel, selectors: this.selectors }).search(_.extend({}, this.query, query)).exec(callback);
	}
	 
});