var plugin = require("plugin"),
outcome = require("outcome");
require("structr").mixin(require("structr-step"));

function getConfig(options) {
	if(!options) options = "~/.maestro/config";
	return typeof options == "object" ? options : require(options.replace("~", process.env.HOME));
}

/**
 * this should be called on one machine
 */

module.exports = function(options) {
	return plugin().
	params(getConfig(options || {})).
	params({
		type: "server"
	}).
	require(__dirname + "/common").
	require(__dirname + "/server-plugins/maestro").
	require(__dirname + "/server-plugins");
}

/**
 * this should be called on each machine
 */

module.exports.client = function(options) {
	return plugin().
	params(getConfig(options || {})).
	params({
		type: "client"
	}).
	require(__dirname + "/common").
	require(__dirname + "/client-plugins");
}
