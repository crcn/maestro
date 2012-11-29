var Sync = require("./sync"),
Collection = require("./collection");


exports.require = ["./models", "transport.core"];
exports.plugin = function(models, services) {

	//the collection of all servers 
	var collection = new Collection();

	//glues the maestro server collection with all servers under each service from Linode, EC2, rackspace, gogrid, etc.
	var sync = new Sync(collection, services);

	//synchronize immediately.
	sync.start();

	return {
		sync: sync,
		models: models
	}
}