var outcome = require("outcome"),
step = require("step"),
request = require("request"),
logger = require("winston").loggers.get("server"),
sprintf = require("sprintf").sprintf,
_ = require("underscore");

exports.require = ["mongodb", "transport.core", "queryWatcher"];
exports.plugin = function(db, transports, queryWatcher, loader) {
	var Schema = db.base.Schema,
	Model = db.base.Model,
	pingTries = 5; // should be in config


	var Server = new Schema({

		/**
		 * the id tied to the given service
		 */

		"_id": { type: String, unique: { index: true }},

		/**
		 * the name of the server
		 */

		"name": String,

		/**
		 * instance type: micro, medium, large, etc.
		 */

		"type": String,

		/**
		 * the service hosting the server (ec2, gogrid, rackspace)
		 */

		"service": String,

		/**
		 * the image id for the server - used for cloning, and identifying what type this server is
		 */

		"imageId": String,

		/**
		 */

		"imageName": String,

		/**
		 * the namespace for the server, or IP. used for communication
		 */

		"ns": String,

		/**
		 * server state: running, stopped, terminated
		 */

		"state": String,

		/**
		 * where is this server located?
		 */

		"zone": String,

		/**
		 * additional info about the server
		 */

		"tags": {type: { }, default: function(){ return {}; }},

		/**
		 */

		"createdAt": { type: Date, default: Date.now },

		/**
		 */

		"numConnections": { type: Number, default: 0 },

		/**
		 */

		"lastSuccessfulPingAt": { type: Date, default: Date.now },

		/**
		 */

		"lastUpdatedAt": { type: Date, default: Date.now },

		/**
		 */

		"lastSelectedAt": { type: Date, default: Date.now },

		/**
		 */

		"lastSyncAt": { type: Date, default: Date.now },

		/**
		 */

		"disconnectedAt": Date

	});

	Server.pre("save", function(next) {
		this.lastUpdatedAt = new Date();
		next();
	});

	Server.post("save", function() {
		queryWatcher.emit("update", this);
	});

	Server.post("remove", function() {
		queryWatcher.emit("remove", this);
	});


	Server.method({
		clone: function(callback) {
			var constructor = this.constructor;
			getService(this).createServer({
				imageId: this.imageId,
				type: this.type
			}, outcome.error(callback).success(function(serv) {
				var server = new constructor(serv);
				server.save(callback);
			}));
		},
		ping: function(tries, callback) {

			logger.info(sprintf("ping server id=%s tries=%d", this._id, tries));

			if(arguments.length == 1) {
				callback = tries;
				tries = pingTries;
			}

			tries--;

			var ops = {
				url: ["http://" , loader.params("auth.user"), ":", loader.params("auth.pass"), "@", this.ns, ":",loader.params("client.port"),"/server"].join(""),
				json: this.toObject(),
				timeout: 2000
			},
			self = this;

			request.post(ops, outcome.error(function(err) {

				setTimeout(function() {
					if(!tries) {
						logger.info(sprintf("uanble to connect to %s", self._id));
						self.disconnectedAt = new Date();
						callback(new Error("unable to connect"));
					} else {
						self.ping(tries, callback);
					}	
				}, 2000);
			}).success(function(response, body) {
				self.disconnectedAt = null;
					logger.info(sprintf("successfuly ping server id=%s", self._id));
				self.save(callback);
			}));
		},
		use: function(callback) {
			var self = this,
			on = outcome.error(callback);
			logger.info(sprintf("using server id=%s", self._id));

			step(
				function() {
					self.sync(this);
				},
				on.success(function() {
					self.start(this);
				}),
				on.success(function() {
					self.ping(500, this);
				}),
				callback
			);
		},
		exists: function(callback) {
			getService(this).getServerInfo(this, outcome.error(callback).success(function(info) {
				callback(null, !!info);
			}))
		},
		sync: function(callback) {
			var self = this;
			logger.info(sprintf("sync server id=%s", self._id));
			getService(this).getServerInfo(this, outcome.error(callback).success(function(info) {
				_.extend(self, info);
				self.save(callback);
			}))
		},
		start: function(callback) {
			var service = getService(this),
			self = this;
			if(this.state == "running") return callback();
			logger.info(sprintf("start server id=%s", self._id));

			function waitUntilReady() {
			logger.info(sprintf("wait until running server id=%s", self._id));
				self.sync(function() {
					logger.info(sprintf("server id=%s state=%s", self._id, self.state));
					if(self.state == "running" && self.ns) return callback();
					setTimeout(waitUntilReady, 1000);
				})
			}

			if(/pending|reboot/.test(this.state)) {
				waitUntilReady();
			} else 
			if(/stopping/.test(this.state)) {
				setTimeout(function() {
					this.sync(function() {
						self.start(callback);
					});
				}, 2000);
			} else
			if(/stopped/.test(this.state) || true) {
				service.startServer(this, waitUntilReady);
			} else {
				callback(new Error("cannot start server"));
			}
		},
		reboot: function(callback) {
			this.state = "reboot";
			this.save();
			getService(this).rebootServer(this, callback);
		},
		stop: function(callback) {
			this.state = "shutting-down";
			this.save();
			getService(this).stopServer(this, callback);
		},
		destroy: function(callback) {
			var self = this, on = outcome.error(callback);
			this.status = "terminating";
			this.save();

			step(

				//destroy first
				function() {
					getService(self).destroyServer(this, callback);
				},

				//then remove this instance
				on.success(function() {
					self.remove(this);
				}),

				//and complete
				callback
			);	
		}
	});

	function getService(server) {
		return transports.getService(server.service);
	}



	return {
		Server: db.model("servers", Server)
	};
}