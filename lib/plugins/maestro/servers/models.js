exports.require = ["mongodb", "transports.core", "queryWatcher"]
exports.plugin = function(db, transports, queryWatcher) {
	var Schema = db.base.Schema;


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

	Server.methods.clone = function(callback) {

	}

	Server.methods.sync = function() {

	}

	Server.methods.startup = function(callback) {
		callback();
		console.log("START")
	}

	Server.methods.shutdown = function(callback) {

	}

	Server.methods.destroy = function(callback) {

	}


	return {
		Server: db.model("servers", Server)
	};
}