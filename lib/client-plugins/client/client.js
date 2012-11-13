var structr = require("structr"),
request = require("request"),
logger = require("winston").loggers.get("client");

module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this._maestroHost = options.maestroHost;
		this._auth = options.auth;
	},

	/**
	 */

	"setInfo": function(info) {
		this._info = info;
		logger.verbose("setting server info");
	},

	/**
	 */

	"update": function(data) {

		var ops = {
			url: ["http://" , this._auth.user , ":" , this._auth.pass , "@", this._maestroHost , "/servers/", this._info._id ].join(""),
			json: data
		};

		request.put(ops, function(err){
			if(err) logger.error(err);
		});
	}
});