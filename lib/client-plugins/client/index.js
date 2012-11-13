var Client = require("./client");

exports.plugin = function(loader) {
	return new Client(loader.params());
}