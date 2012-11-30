var plugin = require("plugin"),
outcome = require("outcome");
require("structr").mixin(require("structr-step"));



/**
 * this should be called on one machine
 */

exports.server = function(options) {
	return plugin().
	params(options || {}).
	paths(__dirname + "/../node_modules").
	require("plugin-express").
	require(__dirname + "/common").
	// require(__dirname + "/server/maestro").
	require(__dirname + "/server");
}

/**
 * this should be called on each machine
 */

exports.client = function(options) {
	return plugin().
	params(options || {}).
	paths(__dirname + "/../node_modules").
	require("plugin-express").
	require(__dirname + "/common").
	require(__dirname + "/client");
}


exports.plugin = function(loader) {
	var type = loader.params("maestro.type");
	console.log("GG")

	if(type == "server") {
		return exports.server(loader.params("maestro")).load().module("maestro.core");
	} else {
		return exports.client(loader.params("maestro")).load().module("pupil.core");
	}
}
