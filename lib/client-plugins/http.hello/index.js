exports.require = ["http.server", "client"];
exports.plugin = function(server, client) {
	server.post("/server", function(req, res) {
		client.setInfo(req.body);
		res.end("OK!");
	});
}