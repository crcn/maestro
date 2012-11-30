var Collection = require("./collection");

exports.require = [["transport.part.*"]];
exports.plugin = function(transportClasses, loader) {
	var transports = getTransports(transportClasses, loader.params("services"));
	return new Collection(transports);
}


function getTransports(transportClasses, params) {
	var transports = [];


	for(var name in params) {
		for(var i = transportClasses.length; i--;) {
			if(transportClasses[i].serviceName == name) {
				transports.push(new transportClasses[i](params[name]));
				break;
			}
		}
	}

	return transports;
}