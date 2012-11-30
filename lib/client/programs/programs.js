var structr = require("structr"),
fs = require("fs"),
step = require("step"),
Program = require("./program"),
freeport = require("freeport"),
sift = require("sift"),
async = require("async"),
EventEmitter = require("events").EventEmitter;



module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(dir) {
		this.dir = dir;
		this._programs = {};
		this.reread();
	},

	/**
	 */

	"processes": function(query) {
		var procs = [];
		for(var key in this._programs) {
			procs = this._programs[key].processes().concat(procs);
		}
		return query ? sift(query, procs) : procs;
	},


	/**
	 */


	"reread": function() {
		var self = this;
		console.log("reread programs");
		fs.readdirSync(this.dir).forEach(function(programName) {
			if(programName == ".DS_Store") return;
			self._addProgram(programName);
		});
		if(this.ready) this.startAll();
		return this;
	},

	/**
	 */

	"_addProgram": function(programName) {
		var program = this._programs[programName] || (this._programs[programName] = new Program(this.dir + "/" + programName, programName, this));
		program.reread();
	},

	/**
	 */

	"step start": function(name, next) {
		var process = this.process(name),
		self = this;

		freeport(function(err, port) {
			process.start({
				port: port
			}, next);

			self.emit("startProcess", process);
		});
	},

	/**
	 */

	"process": function(name) {
		return sift({ name: name }, this.processes()).pop();
	},

	/**
	 */

	"step startAll": function(next) {
		var self = this;
		this.ready = true;
		async.forEach(this.processes(), function(process, next) {
			self.start(process.name, next);
		}, next);
	}
});