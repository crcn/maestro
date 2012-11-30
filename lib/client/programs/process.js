var structr = require("structr"),
forever = require("forever-monitor"),
_ = require("underscore"),
path = require("path"),
fs = require("fs"),
EventEmitter = require("events").EventEmitter;


module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(dir, name, info) {
		console.log("adding process %s", name);

		this.name = name;
		this.command = info.command;
		this.info = info;

		delete info.command;

		info.cwd = dir;
		info.sourceDir = dir;
	},

	/**
	 */

	"step start": function(startOps, next) {
		this.running = true;

		console.log("%s listening on port %d", this.name, startOps.port);

		this.startupInfo = startOps;

		if(typeof startOps == "function") {
			next = startOps;
			startOps = {};
		}

		if(this._child) return next();

		var self = this;


		self._child = new forever.Monitor(this.command, _.defaults({
			env: {
				PU_PORT: startOps.port,
				HOSTNAME: startOps.hostname
			}
		}, this.info));

		self._child.on("error", function(err) {
			console.error(err.stack);
		});

		self._child.on("stderr", function(err) {
			// process.stdout.write(err);
		});

		self._child.on("exit", function(exit) {
			console.log("exit")
			self._child = null;
		});

		self._child.on("stdout", function(out) {
			// process.stdout.write(out);
		});	

		self._child.start();

		next();
		
	},

	/**
	 */

	"step stop": function(next) {
		this.running = false;
		if(!this._child) return next();
		this._child.once("exit", next);
		this._child.stop();
	},

	/**
	 */

	"restart": function(next) {
		var self = this;
		this.stop(function() {
			self.start(next);
		})
	}
});