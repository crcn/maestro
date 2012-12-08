var structr = require("structr");

module.exports = structr({

	/**
	 */

	"__construct": function(servers) {
		this.provider = "local";
		var self = this, id = 0;
		this.servers  = servers.map(function(server) {
			return new Server("local"+(id++), server.host, self);
		});
	},
	"getServers": function(cb) {
		cb(null, this.servers);
	}
});


var Server = structr({
	"__construct": function(id, address, service) {
		this.client = service;
		this.id = id;
		this.imageId = "∞";
		this.status = "RUNNING";
		this.addresses = { public: [address] };

		/*{
				_id: target.id,
				service: target.client.provider,
				imageId: target.imageId,
				state: target.status,
				lastSelectedAt: new Date(),
				type: target.type,
				address: target.addresses ? target.addresses.public.concat().pop() : null
			};
			*/
	},
	"refresh": function(callback) {
		callback();
	},
	"destroy": function(callback) {
		//cannot destroy
		callback();
	}
})