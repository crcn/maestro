exports.require = ["plugin-express"];
exports.plugin = function(server, loader) {
	return server.listen(loader.params(loader.params("type") + ".port"));
}