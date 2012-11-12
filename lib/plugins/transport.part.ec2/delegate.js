var structr = require("structr"),
aws         = require("aws-lib"),
outcome     = require("outcome");

module.exports = structr({

	/**
	 */

	"__construct": function(params) {
		this._ec2 = aws.createEC2Client(params.accessKeyId, params.secretAccessKey);
		this.name = "ec2";
	},

	/**
	 */

	"getAllServers": function(callback) {

		var host = this.name;

		this._ec2.call("DescribeInstances", {}, outcome.error(callback).success(function(result) {

			var servers = result.reservationSet.item.map(function(instance) {

				var iset = instance.instancesSet.item;

				return {
					_id: iset.instanceId, 
					imageId: iset.imageId,
					zone: iset.placement.availabilityZone,
					ns: iset.dnsName,
					type: iset.instanceType,
					service: host,
					architecture: iset.architecture //x86_64
				}
			});

			callback(null, servers);
		}));
	},

	/**
	 */

	"stopServer": function(server, callback) {
		this._callIsetMethod(server, "StopInstances", callback);
	},

	/**
	 */

	"startServer": function(server, callback) {
		this._callIsetMethod(server, "StartInstances", callback);
	},

	/**
	 */

	"rebootServer": function(server, callback) {
		this._callIsetMethod(server, "RebootInstances", callback);
	},

	/**
	 */

	"destroyServer": function(server, callback) {
		this._callIsetMethod(server, "TerminateInstances", callback);
	},

	/**
	 */

	"cloneServer": function(server, callback) {
		this.createServer({
			imageId: server.imageId
		}, callback);
	},

	/**
	 */

	"createServer": function(options, callback) {
		this._ec2.call("RunInstances", {
			"ImageId": options.imageId,
			MinCount: options.minCount || 1,
			MaxCount: options.MaxCount || 1,
			"KeyName": options.keyName,
			// "SecurityGroupId.1": options.securityGroupId,
			"InstanceType": options.instanceType,
			"Placement.AvailabilityZone": options.zone,

		});
	},

	/**
	 */

	"_callIsetMethod": function(server, method, callback) {
		this._ec2.call(method, { "InstanceId.1": server._id }, this._mapIsetCallback(callback)); 
	},

	/**
	 */

	"_mapIset": function(target) {
		var iset = target.instancesSet.item;

		return {
			_id: iset.instanceId, 
			imageId: iset.imageId,
			zone: iset.placement.availabilityZone,
			ns: iset.dnsName,
			type: iset.instanceType,
			service: host,
			architecture: iset.architecture //x86_64
		};
	},

	/**
	 */

	"_mapIsetCallback": function(callback) {
		var self = this;
		return outcome.error(callback).success(function(result) {
			return callback(null, self._mapIset(result));
		});
	}
});

module.exports.serviceName = "ec2";