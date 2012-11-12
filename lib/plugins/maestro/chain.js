var structr = require("structr"),
_ = require("underscore"),
step = require("step"),
outcome = require("outcome"),
seq = require("seq"),
fiddle = require("fiddle"),
logger = require("winston").loggers.get("maestro.chain"),
sprintf = require("sprintf").sprintf,
EventEmitter = require("events").EventEmitter;


/**
 */

module.exports = structr({

	"__construct": function(options) {
		this.ServerModel = options.ServerModel;
		this.selectors = options.selectors;
		this._queryWatcher = options.queryWatcher;
		this._em = new EventEmitter();
		this.options = {
			"select": "roundRobin",
			"delay": 1000 * 60 //for watching changes
		};
	},

	/**
	 */

	"delay": function(amount) {
		this.options.delay = amount; 
		return this;
	},

	/**
	 */

	"query": function(query) {
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

	"watch": function() {

		var args = Array.prototype.slice.call(arguments, 0),
		query = args.shift(),
		listenTo = args;

		if(!listenTo.length) listenTo = ["update"];

		this._listenTo = listenTo; //needed for modifiers

		listenTo.forEach(function(ev) {
			this._queryWatcher.on(query, ev, function(server) {
				self._em.emit(ev, server);
			});
		});

		return this;
	},


	/**
	 */

	"step find": function(callback) {

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
				callback(null, servers);
			})
		);
	},

	/**
	 */

	"step watch": function(query, delay, next) {
		this._watching = true;
		next();
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

	"step count": function(next) {
		return callback(null, this._result.length);
	},

	/**
	 */

	"_eachResult": function(fn, callback) {

		var calledBack = false,
		self = this;

		function cb() {
			//need this set incase we're watching for results
			if(!calledBack) {
				calledBack = true;
				callback();
			}
		}

		function onResults(result) {

			//need to step incase a trigger has been emitter for the watcher
			self.step(function(next) {
				seq(result).seqEach(function(server) {
					fn(server, this);
				}).catch(callback).
				seq(function() {
					cb();
					next();
				});		
			});
		}

		if(this._result) {
			onResults(this._result);
		} else
		if(this._listenTo) {
			this._listenTo.forEach(function(ev) {
				self._em.on(ev, _.debounce(function(server) {
					onResults([server]);
				}), this.options.delay);
			});
			cb();
		} else {
			throw new Error("cannot handle results");
		}
	},

	/**
	 */

	"_execResultCommand": function() {
		var args = Array.prototype.slice.call(arguments, 0),
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