var structr = require("structr"),
fs = require("fs"),
_ = require("underscore"),
Process = require("./process");

module.exports = structr({
	"__construct": function(path, name, programs) {
		this.path = path;
		this.name = name;
		this._processes = {};
		console.log("adding program %s", name);
	},
	"processes": function() {
		return _.values(this._processes);
	},
	"reread": function() {
		try {
			this.config = JSON.parse(fs.readFileSync(this.path + "/forever.json"));
		} catch(e) { 
			this.config = {};
		}

		this._addProcesses();
	},
	"_addProcesses": function() {
		for(var processName in this.config.process) {
			this._addProcess(processName, this.config.process[processName]);
		}
	},
	"_addProcess": function(processName, processInfo) {
		if(!this._processes[processName]) {
			this._processes[processName] = new Process(this.path, this.name + "." + processName, processInfo);
		}
	}
})