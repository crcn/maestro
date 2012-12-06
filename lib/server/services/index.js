var Services = require("./services");

exports.plugin = function(loader) {
	return new Services(loader.params("services"));
}