var spawn = require("child_process").spawn,
fs = require("fs");

exports.require = ["commands", "programs"];
exports.plugin = function(commands, programs) {

	function exec2(proc, program, args) {

		if(!program) return console.error("program must be defined for git command");

		var programDir = programs.dir + "/" + program;

		try {
			fs.mkdirSync(programDir);
		} catch(e) {

		}
		// getServers({"service.name":"local"}).exec().run("git.clone", { program: "browsertap", repo: "git@github.com:crcn/browsertap.git"});

		var proc = spawn(proc, args || [], { cwd: programDir });

		proc.stdout.on("data", function(chunk) {
			process.stdout.write(chunk);
		});

		proc.stderr.on("data", function(chunk) {
			process.stderr.write(chunk);
		});

		proc.on("exit", function() {
			programs.reread();
		})
	}

	commands.on("git.pull", function(args) {
		exec2("git", args.program, ["pull"]);
	});


	commands.on("git.clone", function(args) {

		var repo = args.repository || args.repo;

		console.log(args)

		if(!repo) return console.error("repo must exist");

		exec2("git", args.program, ["clone", repo, "."]);
	});

}