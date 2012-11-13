var plugin = require("plugin"),
outcome = require("outcome");
require("structr").mixin(require("structr-step"));

/**
 * this should be called on one machine
 */

module.exports = function(options) {
	return  plugin().
	params(options || {}).
	require(__dirname + "/common").
	require(__dirname + "/server-plugins");
}

/**
 * this should be called on each machine
 */

module.exports.client = function(options) {
	return plugin().
	params(options || {}).
	require(__dirname + "/common").
	require(__dirname + "/server-plugins");
}
