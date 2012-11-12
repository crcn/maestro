var Maestro = require("./maestro");

exports.require = ["./servers", "queryWatcher", "select.core"];
exports.plugin = function(servers, queryWatcher, selectors, loader) {
	return new Maestro({
		sync: servers.sync,
		selectors: selectors,
		queryWatcher: queryWatcher,
		ServerModel: servers.models.Server,
		groups: loader.params("groups")
	});
}