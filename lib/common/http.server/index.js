var express = require("express"),
logger = require("winston").loggers.get("http.server");
sprintf = require("sprintf").sprintf;

exports.require = ["maestro"];

exports.plugin = function(maestro, loader) {
	var server = express(),
	port = loader.params(loader.params("type") + ".port");
	server.use(function(req, res, next) {
		// console.log(req.headers)
    	res.header("Access-Control-Allow-Origin", req.headers.origin);
    	res.header("Access-Control-Allow-Headers", "X-Requested-With");
    	res.header("Access-Control-Allow-Credentials", "true");
    	next();
	})
	server.use(express.bodyParser());

	if(port) {
		logger.info(sprintf("http server listening on port %d", port));
		server.target = server.listen(port);
	}

	return server;
}