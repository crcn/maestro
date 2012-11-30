var structr = require("structr"),
fiddle = require("fiddle"),
dref = require("dref"),
states = require("../states"),
outcome = require("outcome"),
_ = require("underscore"),
step = require("step"),
sprintf = require("sprintf").sprintf,
Pupil = require("./pupil");


module.exports = structr({

	/**
	 * Constructor
	 * @param info the info about the server such as image, name, gateway, status, etc.
	 * @param service the service this server belongs to. Rackspace? EC2? Linode?
	 * @param collection the collection of all servers
	 */

	"__construct": function(info, collection) {

		this.info       = info;
		this.service    = info.service;
		info.service = { name: info.service.name };
		this.collection = collection;
		this._pupil = new Pupil({ port: collection._clientPort, auth: collection._auth }, this);
		this.set("lastSelectedAt", new Date());
		this._emit("insert");

		this._logAction("insert");
	},

	/**
	 * returns a value from the server info
	 */

	"get": function(key) {
		return key ? dref.get(this.info, key) : this.info;
	},

	/**
	 */

	"set": function(key, value) {
		dref.set(this.info, key, value);
		this._emit("update");
	},

	/**
	 * removes this server
	 */

	"removeSync": function() {
		this.collection.removeSync({ _id: this.info._id });
		this._emit("remove");
	},

	/**
	 * updates this server
	 */

	"updateSync": function(update) {
		var fiddler = fiddle(update);
		this._logAction("update")
		fiddler(this.info);
		this.set("lastUpdateAt", new Date());
		return true;
	},

	/**
	 */

	"step start": function(callback) {
		this._start(callback);
	},

	/**
	 */

	"step run": function(command, args, callback) {
		var self = this;
		this._start(function() {
			self._pupil.run(command, args, callback);
		});
	},

	/**
	 */

	"step use": function(callback) {
		var self = this;
		step(

		);
	},

	/**
	 */

	"_start": function(callback) {
		this._logAction("starting");

		var self = this,
		on = outcome.error(callback);

		function onRunning() {
			self._emit("started");
			self._logAction("started");
			callback();
		}

		function waitUntilPing() {
			self._logAction("ping");
			self._ping(onRunning);
		}

		function waitUntilReady() {
			self._waitUntilState("running", waitUntilPing);
		}

		function start() {
			step(
				function() {
					self.sync(this);
				},
				on.success(function() {

					var state = self.get("state");
					if(/running/.test(state)) {
						waitUntilPing();
					} else
					if(/pending|reboot/.test(state)) {
						waitUntilReady();
					} else
					if(/stopping/.test(state)) {
						self._waitUntilState(states.STOPPED, start);
					} else
					if(/stopped/.test(state)) {
						self.service.startServer(self, waitUntilReady);
					} else {
						callback(new Error(sprintf("cannot start server. Unknown state: %s", state)));
					}
				})
			);	
		}

		start();
	},

	/**
	 */

	"step stop": function(callback) {
		this._logAction("stopping");

		function onStopped() {
			self._logAction("stopped");
			self._emit("stopped");
			callback();
		}

		function waitUntilStopped() {
			self._waitUntilState(states.STOPPED, onStopped);
		}

		var self = this, on = outcome.error(callback);

		step(
			function() {
				self.sync(this);
			},
			on.success(function() {
				var state = self.get("state");
				if(/stopped/.test(state)) {
					onStopped();
				} else
				if(/stopping/.test(state)) {
					waitUntilStopped();
				} else {
					self.service.stopServer(self, waitUntilStopped);
				}
			})
		);
	},

	/**
	 */

	"step reboot": function(callback) {
		this._logAction("rebooting");

		function onRebooted() {
			self._logAction("rebooted");
			self._emit("rebooted");
			callback();
		}

		function waitUntilReady() {
			self._waitUntilState("running", onRebooted);
		}

		function waitUntilRebooting() {
			self._waitUntilState("reboot", waitUntilReady);
		}

		var self = this, on = outcome.error(callback);

		step(
			function() {
				self.sync(this);
			},
			function() {
				var state = self.get("state");
				if(/rebooting/.test(state)) {
					waitUntilReady();
				} else
				if(/stopped|stopping/.test(state)) {
					self._start(onRebooted);
				} else {
					self.service.rebootServer(self, waitUntilRebooting);
				}
			}
		);
	},

	/**
	 */

	"step terminate": function(next) {
		var self = this;
		this._logAction("terminate");
		this.service.terminateServer(this, outcome.error(callback).success(function() {
			self.sync();
			self._emit("terminated");
			self.removeSync();
			next();
		}));
	},


	/**
	 */

	"step clone": function(callback) {
		this._logAction("clone");

		var col = this.collection,
		self = this;

		this.service.cloneServer(this, outcome.error(callback).success(function(info) {
			self._emit("cloned");
			callback(null, col.insertSync(info));
		}));
	},


	/**
	 * synchronized with actual server
	 */

	"step ping": function(next) {
		this._ping(next);
		/*step(
			function() {
				self.sync(this);
			},
			function() {
				var state = self.get("state");

				if(/running/.test(state)) {
					ping();
				} else {
					self._start()
				}
			}
		);*/
	},

	/**
	 */
	"_ping": function(next) {
		var self = this;
		function ping() {
			self._logAction("ping");
			self._pupil.ping(function(err) {
				if(err) return setTimeout(ping, 1000 * 5);
				self._logAction("pong");
				if(next) next();
			});
		}

		ping();

	},

	/**
	 */

	"dispose": function() {
		//remove timeouts, listeners, etc.
	},


	/**
	 */

	"sync": function(callback) {
		var self = this;
		this.service.getServerInfo(this, outcome.error(callback).success(function(info) {
			var ps = self.info.state;
			_.extend(self.info, info);
			if(ps != info.state) {
				self._emit("stateChange");
			}
			if(callback) callback();
		}));
	},

	"_logAction": function(action) {
		console.log("%s %s server image=%s _id=%s state=%s", 
			action, 
			this.service.name, 
			this.get("image.name") || this.get("image._id"), 
			this.get("_id"), 
			this.get("state"));
	},


	/**
	 */

	"_waitUntilState": function(state, next) {
		var self = this;

		function wait() {
			self._logAction("wait");
			self.sync(function() {
				if(self.get("state") == state) {
					return next();
				}
				setTimeout(wait, 1000 * 4);
			})
		}

		wait();
	},



	/**
	 */

	"_emit": function(type) {
		this.collection._watcher.emit(type, this);
	}
});