exports.require = ["mongodb", "transports.core"]
exports.plugin = function(db, transports) {
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

	Server.methods.clone = function(callback) {

	}

	/**
	 * synchronizes data with the actual server
	 */

	Server.methods.sync = function() {

	}

	return {
		Server: db.model("servers", Server)
	};
}