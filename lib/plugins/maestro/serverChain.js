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
			"select": { algorithm: "roundRobin" },
			"delay": 1000 * 60 //for watching changes
		};


		this.step(function(next) {
			options.group.step(function(nx) {
				nx();
				next();
			})
		});
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
	 * minimum number of servers needed to invoke query
	 */

	"min": function(amount) {
		this.options.min = amount;
		return this;
	},

	/**
	 */

	"max": function(amount) {
		this.options.max = amount;
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

	"trigger": function(fn) {
		this.options.trigger = fn;
		return this;
	},

	/**
	 */

	"doesntExist": function(fn) {
		this.options.doesntExist = fn;
		return this;
	},

	/**
	 */

	"each": function(fn) {
		this.options.each = fn;
		return this;
	},

	/**
	 */

	"watch": function() {

		var args = Array.prototype.slice.call(arguments, 0),
		query = args.shift(),
		listenTo = args,
		self = this;

		if(!listenTo.length) listenTo = ["update"];

		this._listenTo = listenTo; //needed for modifiers

		listenTo.forEach(function(ev) {
			self._queryWatcher.on(self.options.query, ev, function(server) {
				self._em.emit(ev, server);
			});
		});

		return this;
	},

	/**
	 */

	"on": function(type, callback) {
		if(typeof type == "object") {
			for(var t in type) {
				this.on(t, type[t]);
			}
			return this;
		}

		this._em.on(type, callback);

		return this;
	},


	/**
	 */

	"step exec": function(callback) {

		var ops = this.options,
		ServerModel = this.ServerModel,
		on = outcome.error(callback),
		self = this,
		min = this.options.min || 0,
		max = this.options.max,
		limit = max;

		function cb(err, result) {
			if(!result.length && self.options.doesntExist) self.options.doesntExist();
			callback(err, result);
		}


		step(

			/**
			 */

			function() {
				ServerModel.count(ops.query, this);
			},

			/**
			 */

			on.success(function(count) {
				limit = Math.min(limit || count, Math.max(0, count - min));
				if(!limit) {
					return cb(null, []);
				}
				this();
			}),

			/** 
			 * find the servers first
			 */

			function() {
				var chain = ServerModel.find(ops.query);
				chain.limit(limit);
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
				if(self.options.each) servers.forEach(self.options.each);
				cb(null, self.options.one ? servers[0] : servers);
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

	"step stop": function(next) {
		this._execResultCommand("stop", next);
	},

	/**
	 */

	"step reboot": function(next) {
		this._execResultCommand("reboot", next);
	},

	/**
	 */

	"step start": function(next) {
		this._execResultCommand("start", next);
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

		function onResults(err, result) {

			//need to step incase a trigger has been emitter for the watcher
			self.step(function(next) {
				seq(result).seqEach(function(server) { 
					var next = this;
					fn(server, function(err) {
						if(err) logger.error(err);
						next();
					});
				}).catch(callback).
				seq(function() {
					cb();
					next();
				});		
			});
		}

		if(this._result) {
			onResults(null, this._result);
		}

		if(this._listenTo) {
			this._listenTo.forEach(function(ev) {

				//debounce so that we aren't too quick to executing commands against servers
				self._em.on(ev, _.debounce(function(server) {

					if(self.options.trigger) {
						self.options.trigger();
					} else {
						//re-fetch the results from the database to get the updated value, and execute.
						self.exec(onResults);
					}
						
				}, self.options.delay));
			});

			if(!this._result) {
				cb();
			}
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
				try {
					selector.sort(servers, this)
				} catch(e) {
					console.log(e)
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