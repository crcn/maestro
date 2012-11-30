var EventEmitter = require("events").EventEmitter;

exports.require = ["plugin-express", "http.private"];
exports.plugin = function(httpServer, authReq) {

	var commands = new EventEmitter();

	httpServer.post("/run", authReq, function(req, res) {
		var cmd = req.body,
		command = cmd.command,
		args = cmd.args;

		console.log("run command %s", command);

		commands.emit(command, args);

		res.end();
	});

	return commands;
}