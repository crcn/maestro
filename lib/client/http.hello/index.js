exports.require = ["plugin-express", "http.private", "pupil.core"];
exports.plugin = function(server, basicAuth, client) {

	server.post("/hello", basicAuth, function(req, res) {
		client.setInfo(req.body);
		res.end("OK!");
	});
	
}