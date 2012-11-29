var structr = require("structr"),
step = require("step"),
outcome = require("outcome"),
seq     = require("seq"),
logger  = require("winston").loggers.get("maestro.servers"),
sprintf  = require("sprintf").sprintf,
request = require("request"),
_ = require("underscore"),
states = require("./states");


module.exports = structr({

	/**
	 */

	"__construct": function(collection, services) {
		this._collection = collection;
		this._services   = services;
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
				self._services.getAllServers(this);
			},

			/**
			 * re-add the servers into the database
			 */

			on.success(function(servers) {
				self._addServersToDbSync(servers);
				self._dumpOldSync();
				this();
			}),

			/**
			 */

			callback
		);
	},

	/**
	 */

	"start": function(timeout, next) {
		if(!next) next = function(){};
		if(this._running) return next();

		if(typeof timeout == "function") {
			next = timeout;
			timeout = undefined;
		}

		if(!timeout) timeout = 1000 * 60;
		var self = this;
		self._stop = false;


		function run() {
			if(self._stop) return;
			self._running = true;
			self.run(function() {
				self._running = false;
				next();
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

	"_addServersToDbSync": function(servers) {
		var self = this;

		//don't add any termimated services
		servers = servers.filter(function(server) {
			return server.state != states.TERMINATED;
		});


		console.log("synchronizing %d servers", servers.length);

		this._collection.insertSync(servers).forEach(function(server) {
			console.log("%s server id=%s, image=%s", server.get("service.name"), server.get("_id"), server.get("imageName") || server.get("imageId"));
			server.set("lastSyncAt", self.lastSync);
		});
	},

	/**
	 */

	"_dumpOldSync": function() {
		var self = this;

		var search = {
			$or: [
				{
					lastSyncAt: { $ne: self.lastSync }
				},
				{
					state: states.TERMINATED
				}
			]
		};

		self._collection.findSync(search, this).forEach(function(server) {
			console.log("removing server id=%s image=%s", server.get("_id"), server.get("imageName") || server.get("imageId"));
			server.removeSync();
		});
	}
});

