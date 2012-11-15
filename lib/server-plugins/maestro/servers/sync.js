var structr = require("structr"),
step = require("step"),
outcome = require("outcome"),
seq     = require("seq"),
logger  = require("winston").loggers.get("maestro.servers"),
sprintf  = require("sprintf").sprintf,
request = require("request");


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

		step(

			/**
			 * 1. dump the servers from cache incase an instance doesn't exist anymore
			 */

			function() {
				self._dumpServers(this);
			},

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

			callback
		);
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

	"_addServer": function(server, next) {
		logger.verbose(sprintf("inserting server id=%s, image=%s", server._id, server.imageName || server.imageId ));
		var serv = new this.ServerModel(server);

		step(
			function() {
				serv.save(this)				
			},
			function(err) {
				serv.ping(1, this);
			},
			function() {
				this();
			},
			next
		);
	},

	/**
	 */

	"_dumpServers": function(callback) {
		logger.info(sprintf("dumping server cache"));

		this.ServerModel.remove({_id:{$ne:null}}, callback);
	}
});