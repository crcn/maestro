exports.require = ["http.server", "http.private", "client"];
exports.plugin = function(server, basicAuth, client) {
	server.post("/server", basicAuth, function(req, res) {
		client.setInfo(req.body);
		res.end("OK!");
	});
}