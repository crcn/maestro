var forever = require("forever-monitor"),
path = require("path"),
fs = require("fs"),
step = require("step");

exports.plugin = function(loader) {
	var scriptsPath = path.normalize(path.dirname(loader.params("configPath"))),
	procPath = path.join(scriptsPath, "programs");

	try {
		fs.mkdirSync(procPath);
	} catch(e) { }

		

	fs.readdirSync(procPath).forEach(function(programName) {
		
	});
}