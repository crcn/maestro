var express = require("express");

exports.require = ["maestro"];

exports.plugin = function(maestro, loader) {
	var server = express(),
	user = loader.params("auth.user"),
	pass = loader.params("auth.pass");

	basicAuth = express.basicAuth(function(u, p) {
		return  u == user && p = pass;
	}, 'Restricted area');

	server.use(basicAuth);
	server.use(express.bodyParser());

	if(loader.params("http.port")) server.listen(loader.params("http.port"));

	return server;
}