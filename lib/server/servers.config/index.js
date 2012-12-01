var ConfigChain = require("./configChain"),
Config = require("./config"),
path = require("path");

exports.require = ["maestro.core"];
exports.plugin = function(maestro, loader) {

	//TODO

	var cfg = new Config(path.join(path.dirname(loader.params("configPath")), "serversConfig.json"));

	maestro.ServerChain.prototype.config = function() {
		return new ConfigChain(cfg, this);
	}
}