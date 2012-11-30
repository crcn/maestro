var structr = require("structr"),
_ = require("underscore"),
step = require("step"),
outcome = require("outcome"),
seq = require("seq"),
fiddle = require("fiddle"),
EventEmitter = require("events").EventEmitter,
states = require("./servers/states");


/**
 */

module.exports = structr({

	"__construct": function(group) {

		this.group = group;

		var root = group.root();

		//the collection of live servers
		this.collection    = root.collection;
		this.selectors     = root.selectors;

		this._em = new EventEmitter();

		this.options = {
			"select": { algorithm: "roundRobin" },
			"delay": 1000 * 60 //for watching changes
		};


		this.step(function(next) {
			group.step(function(nx) {
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
		listenTo = args,
		self = this;

		if(!listenTo.length) listenTo = ["change"];

		this._listenTo = listenTo; //needed for modifiers

		listenTo.forEach(function(ev) {
			self.collection.watch(self.options.query, ev, function(server) {
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

		var ops    = this.options,
		collection = this.collection,
		on         = outcome.error(callback),
		self       = this,
		min        = ops.min || 0,
		max        = ops.max,
		limit      = max;

		function cb(err, result) {
			if((!result || !result.length) && self.options.doesntExist) self.options.doesntExist();
			callback(err, result);
		}

		step(

			/**
			 */

			on.success(function(count) {

				var count = collection.countSync(ops.query);

				limit = Math.min(limit || count, Math.max(0, count - min));

				//if the limit is zero, then return nothing
				if(!limit) {
					return cb(null, self.options.one ? null : []);
				}
				this();
			}),

			/** 
			 * find the servers first
			 */

			function() {

				//ignore any busy servers - don't bother them.
				var q = _.extend({
					state: { $ne: states.TERMINATED }
				}, ops.query);

				this(null, collection.findSync(q).limit(limit).sort(ops.sort).execSync());
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
				servers.forEach(function(server) {
					server.set("lastSelectedAt", new Date());
					if(self.options.each) self.options.each(server);
				})
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

	"step terminate": function(next) {
		this._execResultCommand("terminate", next);
	},

	/**
	 */

	"step clone": function(next) {
		this._execResultCommand("clone", next);
	},

	/**
	 */

	"step ping": function(next) {
		this._execResultCommand("ping", next);
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
						if(err) console.error(err);
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
					console.log(e);
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