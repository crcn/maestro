var structr = require("structr"),
request = require("request"),
logger = require("winston").loggers.get("client"),
EventEmitter = require("events").EventEmitter;

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(options) {
		this._maestroHost = options.maestroHost;
		this._auth = options.auth;
		this._port = options.server.port;
	},

	/**
	 */

	"setInfo": function(info) {
		this._info = info;
		logger.verbose("setting server info");
		this.emit("ready");
	},

	/**
	 */

	"ready": function(callback) {
		if(this._info) return callback();
		this.one("ready", callback);
	},

	/**
	 */

	"update": function(data) {

		var ops = {
			url: ["http://" , this._auth.user , ":" , this._auth.pass , "@", this._maestroHost , ":", this._port, "/servers/", this._info._id ].join(""),
			json: data
		};

		request.put(ops, function(err){
			if(err) logger.error(err);
		});
	}
});