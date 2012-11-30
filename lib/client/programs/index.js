var Programs = require("./programs"),
fs = require("fs"),
path = require("path"),
Proxy = require("./proxy");

exports.require = ["plugin-express", "pupil.core"];
exports.plugin = function(httpServer, pupil, loader) {
	
	var scriptsPath = path.normalize(path.dirname(loader.params("configPath"))),
		procPath = path.join(scriptsPath, "programs");

	try {
		fs.mkdirSync(procPath);
	} catch(e) { }

	var programs = new Programs(procPath);

	pupil.ready(function() {
		programs.startAll();
	});


	return new Proxy(httpServer, programs);
}