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

		var self = this, on = outcome.error(function(err) {
			console.error(err);
			callback(err);
		});

		console.log("fetching all servers");

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

			/*on.success(function() {
				seq(this._collection.allSync()).seqEach(function(server) {
					server.sync(this);
				}).catch(this).seq(this);
			}),*/

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

		if(!timeout) timeout = 1000 * 60 * 10;
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

		this.lastSyncAt = new Date();

		//don't add any termimated services
		servers = servers.filter(function(server) {
			return server.state != states.TERMINATED;
		});

		console.log("synchronizing %d servers", servers.length);


		this._collection.insertSync(servers).forEach(function(server) {
			server.set("lastSyncAt", self.lastSyncAt);
		});
	},

	/**
	 */

	"_dumpOldSync": function() {
		var self = this;

		var search = {
			$or: [
				{
					lastSyncAt: { $ne: self.lastSyncAt }
				},
				{
					state: states.TERMINATED
				}
			]
		};

		self._collection.findSync(search).execSync().forEach(function(server) {
			console.log("removing server id=%s image=%s", server.get("_id"), server.get("image.name") || server.get("image._id"));
			server.removeSync();
		});
	}
});

