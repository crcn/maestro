var structr = require("structr"),
sync = require("./sync"),
_ = require("underscore"),
sift = require("sift"),
fiddle = require("fiddle"),
Server = require("./server");


/**
 * A collection of servers
 */


module.exports = structr({

	/**
	 */

	"__construct": function() {
		this._servers = [];
	},

	/**
	 * inserts 
	 */

	"insertSync": function(info) {

		var server;

		//inserting multiple
		if(info instanceof Array) {

			var servers = [];

			for(var i = info.length; i--;) {
				if(server = this.insertSync(info[i])) {
					servers.push(server);
				}
			}

			return servers;
		}

		//make sure the server doesn't exist first
		var existing = _.find(this._servers, function(ex) {
			return ex._id == info._id;
		});

		//if it does, update it! 
		if(existing) {
			existing.update({ $set: info });
			return existing;
		}

		//otherwise add it
		this._servers.push(server = new Server(info, this));

		return server;
	},

	/**
	 * removes all servers with the given context
	 */

	"removeSync": function(query) {
		this._servers = _.reject(this._servers, this._siftTester(query));
		return true;
	},

	/**
	 * finds ONE server
	 */

	"findOneSync": function(query) {
		return _.find(this._servers, this._siftTester(query));
	},

	/**
	 * finds MANY servers
	 */

	"findSync": function(query) {
		return this._servers.filter(this._siftTester(query));
	},

	/**
	 * updates MANY servers
	 */

	"updateSync": function(query, update) {
		this.findSync(query).forEach(function(server) {
			server.updateSync(update);
		});
		return true;
	},

	/**
	 */

	"_siftTester": function(query) {
		var sifter = sift(query);

		return function(server) {
			return sifter.test(server.info);
		};
	}

});