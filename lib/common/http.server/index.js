var express = require("express"),
logger = require("winston").loggers.get("http.server");
sprintf = require("sprintf").sprintf;

exports.require = ["maestro"];

exports.plugin = function(maestro, loader) {
	var server = express(),
	port = loader.params(loader.params("type") + ".port");

	server.use(express.bodyParser());

	if(port) {
		logger.info(sprintf("http server listening on port %d", port));
		server.target = server.listen(port);
	}

	return server;
}