var Programs = require("./programs"),
fs = require("fs"),
path = require("path"),
Proxy = require("./proxy");

exports.require = ["plugin-express"];
exports.plugin = function(httpServer, loader) {
	
	var scriptsPath = path.normalize(path.dirname(loader.params("configPath"))),
		procPath = path.join(scriptsPath, "programs");

	try {
		fs.mkdirSync(procPath);
	} catch(e) { }

	return new Proxy(httpServer, new Programs(procPath));
}