var Maestro = require("./maestro");

exports.require = ["./servers", "select.core"];
exports.plugin = function(servers, selectors, loader) {
	
	return new Maestro({
		sync: servers.sync,
		selectors: selectors,
		ServerModel: servers.models.Server,
		groups: loader.params("groups")
	})
}