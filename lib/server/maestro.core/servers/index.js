
var Sync = require("./sync"),
gumbo = require("gumbo");


exports.require = ["services"];
exports.plugin = function(services, loader) {

	//the collection of all servers 
	var collection = gumbo.collection([], require("./model").plugin(loader));

	//glues the maestro server collection with all servers under each service from Linode, EC2, rackspace, gogrid, etc.
	var sync = new Sync(collection, services);


	return {
		sync: sync,
		collection: collection
	}
}