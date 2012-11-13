var Maestro = require("./maestro");

exports.require = ["./servers", "queryWatcher", "select.core", "transport.core"];
exports.plugin = function(servers, queryWatcher, selectors, services, loader) {
	return new Maestro({
		sync: servers.sync,
		selectors: selectors,
		queryWatcher: queryWatcher,
		services: services,
		ServerModel: servers.models.Server,
		groups: loader.params("groups")
	});
}