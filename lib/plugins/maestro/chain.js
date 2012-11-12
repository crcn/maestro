var structr = require("structr"),
_ = require("underscore"),
step = require("step"),
outcome = require("outcome"),
seq = require("seq"),
fiddle = require("fiddle"),
logger = require("winston").loggers.get("maestro.chain"),
sprintf = require("sprintf").sprintf;


/**
 */

module.exports = structr({

	"__construct": function(options) {
		this.ServerModel = options.ServerModel;
		this.selectors = options.selectors;
		this.options = {
			"select": "roundRobin"
		};
	},

	/**
	 */

	"search": function(query) {
		this.options.query = query;
		return this;
	},

	/**
	 */

	"update": function(options) {
		this.options.update = options;
		return this;
	},

	/**
	 */

	"limit": function(amount) {
		this.options.limit = amount;
		return this;
	},

	/**
	 */

	"sort": function(sort) {
		this.options.sort = sort;
		return this;
	},

	/**
	 * find one
	 */

	"one": function() {
		this.options.one = true;
		return this;
	},

	/**
	 */

	"options": function(options) {
		_.extend(this.options, options);
		return this;
	},

	/**
	 * selection method: ping, rotate, assigned
	 */

	"select": function(options) {
		this.options.select = options;
		return this;
	},

	/**
	 */

	"autoScale": function(options) {
		this.options.autoScale = options;
		return this;
	},

	/**
	 */

	"watch": function(delay, listeners) {
		return this;
	},

	/**
	 */

	"step exec": function(callback) {

		if(!callback) callback = function() { };

		var ops = this.options,
		ServerModel = this.ServerModel,
		on = outcome.error(callback),
		self = this;


		step(

			/** 
			 * find the servers first
			 */

			function() {
				var chain = ServerModel.find(ops.query);
				if(ops.limit) chain.limit(ops.limit);
				if(ops.sort) chain.sort(ops.sort);
				chain.exec(this);
			},

			/**
			 * then select the servers
			 */

			on.success(function(servers) {
				self._select(servers, this);
			}),

			/**
			 */

			on.success(function(servers) {
				self._result = servers;
			})
		);
	},

	/**
	 */

	"step update": function(values, callback) {
		var fiddler = fiddle(values);
		this._eachResult(function(server, next) {
			fiddler(server);
			server.save(next);
		}, callback);
	},

	/**
	 */

	"step shutdown": function(next) {
		this._execResultCommand("shutdown", next);
	},

	/**
	 */

	"step reboot": function(next) {
		this._execResultCommand("reboot", next);
	},

	/**
	 */

	"step startup": function(next) {
		this._execResultCommand("startup", next);
	},

	/**
	 */

	"step destroy": function(next) {
		this._execResultCommand("destroy", next);
	},

	/**
	 */

	"step clone": function(next) {
		this._execResultCommand("clone", next);
	},

	/**
	 */

	"_eachResult": function(fn, callback) {
		seq(this._result).seqEach(function(server) {
			fn(server, this);
		}).catch(callback).
		seq(function() {
			callback();
		});
	},

	/**
	 */

	"_execResultCommand": function() {
		var args = Array.prototype.slice.apply(arguments, 0),
		command = args.shift(),
		callback = args.pop();
		this._eachResult(function(server, next) {
			server[command].apply(server, args.concat(next));
		}, callback);
	},

	/**
	 */

	"_select": function(servers, callback) {

		var selector    = this.selectors.getSelector(this.options.select),
		one = this.options.one,
		on = outcome.error(callback);

		step(

			/**
			 */

			function() {
				if(one) {
					selector.sort(servers, this)
				} else {
					this(null, servers);
				}
			},

			/**
			 */

			on.success(function(servers) {
				callback(null, one ? [servers[0]] : servers);
			})
		)
	}
});