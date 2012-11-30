var plugin = require("plugin"),
outcome = require("outcome");
require("structr").mixin(require("structr-step"));

function getConfig(options) {
	if(!options) options = process.env.ProgramData ? [process.env.ProgramData, "\\maestro\\config"].join("") : "~/.maestro/config";
	return typeof options == "object" ? options : require(options.replace("~", process.env.HOME));
}

/**
 * this should be called on one machine
 */

exports.server = function(options) {
	return plugin().
	params(options).
	paths(__dirname + "/../node_modules").
	require("plugin-express").
	require(__dirname + "/common").
	require(__dirname + "/server").
	load().
	module("maestro");
}

/**
 * this should be called on each machine
 */

exports.client = function(options) {
	return plugin().
	params(options).
	paths(__dirname + "/../node_modules").
	require("plugin-express").
	require(__dirname + "/common").
	require(__dirname + "/client").
	load().
	module("pupil");
}


exports.plugin = function(loader) {
	var type = loader.params("maestro.type");

	if(type == "server") {
		return exports.server(loader.params("maestro"))
	} else {
		return exports.client(loader.params("maestro"));
	}
}
