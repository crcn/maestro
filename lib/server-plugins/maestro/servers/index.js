var Sync         = require("./sync");


exports.require = ["./models", "transport.core"];
exports.plugin = function(models, transports) {
	var sync = new Sync(models.Server, transports);
	return {
		sync: sync,
		models: models
	}
}