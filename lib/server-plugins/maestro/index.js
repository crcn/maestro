var Maestro = require("./maestro");

exports.require = ["./servers", "select.core", "transport.core"];
exports.plugin = function(servers, selectors, services, loader) {

	var maestro = new Maestro({
		sync: servers.sync,
		selectors: selectors,
		services: services,
		collection: servers.collection,
		groups: loader.params("groups")
	});

	return maestro;
}