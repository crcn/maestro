var structr = require("structr"),
fiddle = require("fiddle"),
dref = require("dref"),
states = require("../states"),
outcome = require("outcome"),
_ = require("underscore"),
step = require("step"),
sprintf = require("sprintf").sprintf;


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
		this.collection = collection;

		//synchronize information with the target server
		// this.sync();

		this.set("lastSelectedAt", new Date());
		this.collection._watcher.emit("insert", this);

		this._logAction("insert");
	},

	/**
	 * returns a value from the server info
	 */

	"get": function(key) {
		return dref.get(this.info, key);
	},

	/**
	 */

	"set": function(key, value) {
		dref.set(this.info, key, value);
		this.collection._watcher.emit("update", this);
	},

	/**
	 * removes this server
	 */

	"removeSync": function() {
		this.collection.removeSync({ _id: this.info._id });
		this.collection._watcher.emit("remove", this);
	},

	/**
	 * updates this server
	 */

	"updateSync": function(update) {
		var fiddler = fiddle(update);
		fiddler(this.info);
		this.set("lastUpdateAt", new Date());
		return true;
	},

	/**
	 */

	"step start": function(callback) {
		this._logAction("starting");

		var self = this,
		on = outcome.error(callback);

		function onRunning() {
			self._logAction("started");
			callback();
		}

		function waitUntilPing() {
			self._logAction("ping");
			onRunning();
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
			callback();
		}

		function waitUntilReady() {
			self._waitUntilState("running", onRebooted);
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
				} else {
					self.service.rebootServer(self, waitUntilReady);
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
			self.removeSync();
			next();
		}));
	},


	/**
	 */

	"step clone": function(callback) {
		this._logAction("clone");

		var col = this.collection;

		this.service.cloneServer(this, outcome.error(callback).success(function(info) {
			callback(null, col.insertSync(info));
		}));
	},


	/**
	 * synchronized with actual server
	 */

	"step ping": function(next) {

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
		// this._logAction("sync");
		this.service.getServerInfo(this, outcome.error(callback).success(function(info) {
			_.extend(self.info, info);
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
				setTimeout(wait, 1000 * 2);
			})
		}

		wait();
	}
});