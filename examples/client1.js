require("../").client(require("/usr/local/etc/maestro/config"), function(err, client) {
	if(err) console.error(err.stack);
	maestro.sync();

	maestro.getServers({ numConnections: 1 }).doesntExist(function() {

	}).exec();



	maestro.getServer({ numConnections: 0 }).exec().clone();
});