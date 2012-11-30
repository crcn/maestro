var structr = require("structr"),
_ = require("underscore"),
httpProxy = require("http-proxy");

module.exports = structr({

	"__construct": function(server, programs) {
		this._server = server;
		this._programs = programs;
		server.use(_.bind(this._handleRequest, this));
		server.on("upgrade", _.bind(this._upgrade, this));
		this.proxy = new httpProxy.RoutingProxy();
	},
	"_handleRequest": function(req, res, next) {
		var process = this._findProcess(req);
		if(!process) return next();

		req.url = req.url.substr(("/" + process.name).length);

		this.proxy.proxyRequest(req, res, {
			host: "localhost",
			port: process.startupInfo.port
		});
	},
	"_upgrade": function(req, res) {
		var processName = this._findProcess(req);
		if(!processName) return next();
	},
	"_findProcess": function(req) {
		var procName = req.path.match(/^\/([^\/]+)/);

		if(!procName) return null;

		return this._programs.process(procName[1]);
	}
});