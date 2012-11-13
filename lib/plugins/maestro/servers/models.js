var outcome = require("outcome"),
step = require("step");

exports.require = ["mongodb", "transport.core", "queryWatcher"];
exports.plugin = function(db, transports, queryWatcher) {
	var Schema = db.base.Schema,
	Model = db.base.Model;



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
		 * the namespace for the server, or IP. used for communication
		 */

		"ns": String,

		/**
		 */

		"status": {},

		/**
		 * where is this server located?
		 */

		"zone": String,

		/**
		 * additional info about the server
		 */

		"tags": {},

		/**
		 */

		"createdAt": { type: Date, default: Date.now },

		/**
		 */

		"numConnections": Number,

		/**
		 */

		"lastSelectedAt": Date

	});

	Server.post("save", function() {
		queryWatcher.emit("update", this);
	});

	Server.post("remove", function() {
		queryWatcher.emit("remove", this);
	});

	Server.methods.init = function() {
		Model.prototype.init.apply(this, arguments);
		this._service = getService(this);
	}

	Server.method({
		clone: function() {

		},
		sync: function() {

		},
		start: function(callback) {
			this._service.startServer(this, callback);
		},
		reboot: function(callback) {
			this._service.rebootServer(this, callback);
		},
		stop: function(callback) {
			this._service.stopServer(this, callback);
		},
		destroy: function(callback) {
			var self = this, on = outcome.error(callback);
			step(

				//destroy first
				function() {
					self._service.destroyServer(this, callback);
				},

				//then remove this instance
				on.success(function() {
					self.remove(this)
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