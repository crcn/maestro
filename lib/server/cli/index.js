var celeri = require("celeri");

exports.require = ["maestro.core"];
exports.plugin = function(maestro) {

	var m2 = {};

	["getAllServers", "getServers"].forEach(function(method) {
		m2[method] = function() {
			var chain = maestro[method].apply(maestro, arguments),
			oldExec = chain.exec;

			chain.exec = function(cb) {

				var newCb = function(err, result) {

					if(err) {
						console.error(err.message);
						return cb(err);
					}

					if(!(result instanceof Array)) {
						result = [result];
					}

					var inf = result.map(function(server) {
						return {
							type: server.get("type"),
							imageName: server.get("image.name") || server.get("image._id"),
							_id: server.get("_id"),
							service: server.get("service.name"),
							state: server.get("state")
						}
					});

					celeri.drawTable(inf, {
						columns: ["_id", "service", "imageName", "state"]
					})
					if(cb) cb(err, result);
				}

				return oldExec.call(chain, newCb);
			}

			return chain;
		}
	})

	return m2;
}