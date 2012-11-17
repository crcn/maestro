var structr = require("structr"),
step = require("step"),
outcome = require("outcome"),
seq     = require("seq"),
logger  = require("winston").loggers.get("maestro.servers"),
sprintf  = require("sprintf").sprintf,
request = require("request"),
_ = require("underscore");


module.exports = structr({

	/**
	 */

	"__construct": function(ServerModel, transports) {
		this.ServerModel = ServerModel;
		this._transports = transports;
	},

	/**
	 */

	"step run": function(callback) {

		var self = this, on = outcome.error();
		this.lastSync = new Date();

		step(

			/**
			 * next fetch ALL the servers from the providers
			 */

			function() {
				self._transports.getAllServers(this);
			},

			/**
			 * re-add the servers into the database
			 */

			on.success(function(servers) {
				self._addServersToDb(servers, this);
			}),

			/**
			 */

			on.success(function() {
				self._dumpOld(this);
			}),

			/**
			 */

			callback
		);
	},

	/**
	 */

	"start": function(timeout, next) {
		if(typeof timeout == "function") {
			next = timeout;
			timeout = undefined;
		}
		if(!timeout) timeout = 1000 * 60;
		var self = this;
		self._stop = false;


		function run() {
			if(self._stop) return;
			self.run(function() {
				if(next) next();
				setTimeout(run, timeout);
			});
		}

		run();
	},

	/**
	 */

	"stop": function() {
		this._stop = true;
	},

	/**
	 */

	"_addServersToDb": function(servers, callback) {
		var self = this;
		logger.info(sprintf("synchronizing %d servers", servers.length));
		seq(servers).seqEach(function(server) {
			self._addServer(server, this);
		}).
		catch(callback).
		seq(function() {
			logger.info(sprintf("done."));
			callback();
		})
	},

	/**
	 */

	"_addServer": function(serv, callback) {

		var Server = this.ServerModel,
		on = outcome.error(callback),
		self = this;


		step(
			function() {
				Server.findOne({ _id: serv._id }, this);
			},
			on.success(function(server) {
				var t;
				if(!server) {
					server = new Server(serv);
					t = "inserting";
				} else {
					t = "updating";
					_.extend(server, serv);
				}

				logger.verbose(sprintf("%s server id=%s, image=%s", t, server._id, server.imageName || server.imageId ));

				//needed so this server doesn't get destroyed
				server.lastSyncAt = self.lastSync;
				server.save(this);
			}),
			callback
		);
	},

	/**
	 */

	"_dumpOld": function(callback) {
		var self = this, on = outcome.error(callback);

		step(
			function() {
				self.ServerModel.find({lastSyncAt:{$ne:self.lastSync}}, this);
			},
			on.success(function(servers) {
				var next = this;
				seq(servers).seqEach(function(server) {
					self._tryDumpingServer(server, this);
				}).catch(callback).seq(function() {
					next();
				});
			}),
			callback
		);	
		
	},

	/**
	 */

	"_tryDumpingServer": function(server, callback) {
		var on = outcome.error(callback);
		step(
			function() {
				server.exists(this);
			},
			on.success(function(exists) {
				if(!exists) {
					logger.info(sprintf("removing server id=%s image=%s", server._id, server.imageName || server.imageId));
					server.remove(this);
				} else {
					logger.warn(sprintf("unable to remove server id=%d. It still exists.", server._id));
					this();
				}
			}),
			callback
		);
	},

	/**
	 */

	"_dumpServers": function(callback) {
		logger.info(sprintf("dumping server cache"));

		this.ServerModel.remove({_id:{$ne:null}}, callback);
	}
});

