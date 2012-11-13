var plugin = require("plugin"),
outcome = require("outcome");
require("structr").mixin(require("structr-step"));

/**
 * this should be called on one machine
 */

module.exports = function(options, callback) {

	if(!callback) callback = function(){ };

	var loader = plugin().
	params(options || {}).
	require(__dirname + "/common").
	require(__dirname + "/server-plugins");

	loader.load(outcome.error(callback).success(function() {
		callback(null, loader.module("maestro"));
	}));
}

/**
 * this should be called on each machine
 */

module.exports.client = function(options, callback) {
	plugin().
	params(options || {}).
	require(__dirname + "/common").
	require(__dirname + "/server-plugins").
	load(callback || function() {});
}
