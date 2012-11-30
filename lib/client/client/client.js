var structr = require("structr"),
request = require("request"),
logger = require("winston").loggers.get("client"),
EventEmitter = require("events").EventEmitter,
sprintf = require("sprintf").sprintf;

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
		logger.verbose(sprintf("setting server info id=%s", info._id));
		this.emit("ready");
	},

	/**
	 */

	"ready": function(callback) {
		if(this._info) return callback();
		this.once("ready", callback);
	},

	/**
	 */

	"update": function(data) {

		this.maestroRequest("put", "/servers/" + this._id, data, function(err) {
			if(err) logger.error(err);
		})
	},

	/**
	 */

	"maestroRequest": function(method, path, data, callback) {
		var ops = {
			url: ["http://" , this._auth.user , ":" , this._auth.pass , "@", this._maestroHost , ":", this._port, path ].join(""),
			json: data
		};


		request[method](ops, function(err, response, body){
			if(err) return callback(err);

			if(body.errors) {
				callback(new Error(body.errors[0].message));
			} else {
				callback(null, body.result);
			}
		});
	}
});