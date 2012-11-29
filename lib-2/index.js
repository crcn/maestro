/*
{
	services: {
		ec2: {
	
		},
		rackspace: {
	
		},
		local: {
	
		},
		gogrid: {
	
		}
	}
}
*/

exports.server = function(config) {

}



/**
 * no config - is proxy
 */

exports.client = function(config) {

}


/**
 * plugin.js
 */

exports.plugin = function(loader) {
	var config = loader.params("maestro");

	if(config.type == "server") {
		exports.server(config);
	} else {
		exports.client(config);
	}
}