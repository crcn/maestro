var plugin = require("plugin"),
outcome = require("outcome");
require("structr").mixin(require("structr-step"));


exports.create = function(options, callback) {

	if(!callback) callback = function(){ };

	var loader = plugin().
	params(options || {}).
	require(__dirname + "/plugins");

	loader.load(outcome.error(callback).success(function() {
		callback(null, loader.module("maestro"));
	}));
}


exports.create(require("/usr/local/etc/maestro/config"), function(err, maestro) {
	if(err) return console.error(err.stack);

	maestro.getAllServers().watch().delay(1000).stop();


	maestro.sync();
});