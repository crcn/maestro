var structr = require("structr"),
fiddle = require("fiddle"),
dref = require("dref");



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
		this.sync();
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
		return dref.set(this.info, key, value);
	},

	/**
	 * removes this server
	 */

	"removeSync": function() {
		return this.collection.removeSync({ _id: this.info._id });
	},

	/**
	 * updates this server
	 */

	"updateSync": function(update) {
		var fiddler = fiddle(update);
		fiddler(this.info);
		return true;
	},

	/**
	 * synchronized with actual server
	 */

	"step sync": function(next) {

	}
});