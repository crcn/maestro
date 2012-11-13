var Watcher = require("./watcher");
exports.plugin = function() {
	return new Watcher();
}