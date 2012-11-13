var structr = require("structr"),
aws         = require("aws-lib"),
outcome     = require("outcome"),
_ = require("underscore"),
logger = require("winston").loggers.get("transport.part.ec2.delegate"),
sprintf = require("sprintf").sprintf;

module.exports = structr({

	/**
	 */

	"__construct": function(params) {
		this._ec2 = aws.createEC2Client(params.accessKeyId, params.secretAccessKey);
		this.name = "ec2";


		/*this._ec2.call("DescribeAvailabilityZones", {}, function(err, result) {
			console.log(result.availabilityZoneInfo.item)
		})*/
	},

	/**
	 */

	"getAllServers": function(callback) {

		var host = this.name, self = this;

		this._ec2.call("DescribeInstances", {}, outcome.error(callback).success(function(result) {

			var servers = result.reservationSet.item.map(function(instance) {
				return self._mapIset(instance);
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

		logger.info(sprintf("creating new server id=%s type=%s", options.imageId, options.type));

		var self = this;
		this._ec2.call("RunInstances", this._removeUndef({
			"ImageId": options.imageId,
			MinCount: options.minCount || 1,
			MaxCount: options.maxCount || 1,
			"KeyName": options.keyName,
			// "SecurityGroupId.1": options.securityGroupId,
			"InstanceType": options.type,
			"Placement.AvailabilityZone": options.zone,
		}), outcome.error(callback).success(function(result) {
			callback(null, self._mapIset(result));
		}));
	},

	/**
	 */

	"_callIsetMethod": function(server, method, callback) {
		logger.info(sprintf("%s: %s %s", this.name, method, server._id ));
		this._ec2.call(method, { "InstanceId.1": server._id }, this._mapIsetCallback(callback)); 
	},

	/**
	 */

	"_removeUndef": function(target) {
		for(var key in target) {
			if(!target[key]) delete target[key];
		}
		return target;
	},

	/**
	 */

	"_mapIset": function(target) {
		var iset = target.instancesSet.item;


		return this._removeUndef({
			_id: iset.instanceId, 
			imageId: iset.imageId,
			zone: iset.placement ? iset.placement.availabilityZone : undefined,
			ns: iset.dnsName,
			type: iset.instanceType,
			service: this.name,
			architecture: iset.architecture //x86_64
		});
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