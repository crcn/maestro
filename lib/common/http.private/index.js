
exports.require = ["plugin-express"];
exports.plugin = function(server, loader) {

	var user = loader.params("auth.user"),
	pass = loader.params("auth.pass");

	return server.express.basicAuth(function(u, p) {
		return  u == user && p == pass;
	}, 'Restricted area');
}