var express = require("express"),
logger = require("winston").loggers.get("http.server");
sprintf = require("sprintf").sprintf;

exports.require = ["maestro"];

exports.plugin = function(maestro, loader) {
	var server = express(),
	user = loader.params("auth.user"),
	pass = loader.params("auth.pass"),
	port = loader.params("http.port");

	basicAuth = express.basicAuth(function(u, p) {
		return  u == user && p = pass;
	}, 'Restricted area');

	server.use(basicAuth);
	server.use(express.bodyParser());


	if(port) {
		logger.info(sprintf("http server listening on port %d", port));
		server.listen(port);
	}

	return server;
}