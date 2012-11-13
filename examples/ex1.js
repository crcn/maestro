require("../").create(require("/usr/local/etc/maestro/config"), function(err, maestro) {
	if(err) console.error(err.stack);
	maestro.getAllServers().exec();
	maestro.sync();

	maestro.getServers({ connection: 1 }).doesntExist(function() {
		console.log("MAKE NEW")
	}).exec();
});