require("../")(require("/usr/local/etc/maestro/config"), function(err, maestro) {
	if(err) console.error(err.stack);
	maestro.sync();

	maestro.getServers({ numConnections: 1 }).doesntExist(function() {

	}).exec();



	maestro.getServer({ numConnections: 0 }).exec(function(err, server) {
		console.log(server);
	})
});