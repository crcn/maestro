var structr = require("structr"),
aws         = require("aws-lib"),
outcome     = require("outcome"),
_ = require("underscore"),
logger = require("winston").loggers.get("transport.part.ec2.delegate"),
sprintf = require("sprintf").sprintf,
dref = require("dref");

module.exports = structr({

	/**
	 */

	"__construct": function(params) {
		this._ec2 = aws.createEC2Client(params.accessKeyId, params.secretAccessKey);
		this.name = "ec2";

		this.getImages();
	},

	/**
	 */

	"step getImages": function(callback) {
		this._images = { };
		var self = this;
		this._ec2.call("DescribeImages", { "Owner.1": "self" }, function(err, result) {

			if(!result.imagesSet.item) return;

			var images = result.imagesSet.item instanceof Array ? result.imagesSet.item : [result.imagesSet.item];


			images.forEach(function(image) {
				var imageName = typeof image.description == "string" ? image.description : image.name;
				logger.info(sprintf("registering AIM %s", imageName));
				self._images[image.imageId] = imageName;
				self._images[imageName] = image.imageId;
			});

			callback();
		});
	},

	/**
	 */

	"step getAllServers": function(callback) {

		var host = this.name, self = this;

		this._ec2.call("DescribeInstances", {}, outcome.error(callback).success(function(result) {

			var item = result.reservationSet.item;
			var servers = (item instanceof Array ? item : [item]).map(function(instance) {
				return self._mapIset(instance);
			});

			callback(null, servers);
		}));
	},

	/**
	 */

	"stopServer": function(server, callback) {
		this._callIsetMethod(server, "StopInstances", null, callback);
	},

	/**
	 */

	"startServer": function(server, callback) {
		this._callIsetMethod(server, "StartInstances", null, callback);
	},

	/**
	 */

	"rebootServer": function(server, callback) {
		this._callIsetMethod(server, "RebootInstances", null, callback);
	},

	/**
	 */

	"destroyServer": function(server, callback) {
		this._callIsetMethod(server, "TerminateInstances", null, callback);
	},

	/**
	 */

	"step cloneServer": function(server, callback) {
		this.createServer({
			imageId: server.imageId
		}, callback);
	},

	/**
	 */

	"getServerInfo": function(server, callback) {
		this._callIsetMethod(server, "DescribeInstances", "reservationSet.item", callback);
	},

	/**
	 */

	"step createServer": function(options, callback) {

		logger.info(sprintf("creating new server id=%s type=%s", options.imageId, options.type));


		var self = this;
		this._ec2.call("RunInstances", this._removeUndef({
			"ImageId": self._images[options.imageName] || options.imageId,
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

	"step _callIsetMethod": function(server, method, ref, callback) {
		logger.info(sprintf("%s: %s %s", this.name, method, server._id ));
		this._ec2.call(method, { "InstanceId.1": server._id }, this._mapIsetCallback(callback, ref)); 
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


		if(!target.instancesSet) return false;
		var iset = target.instancesSet.item;

		return {
			_id: iset.instanceId, 
			imageId: iset.imageId,
			imageName: this._images[iset.imageId] || null,
			zone: iset.placement ? iset.placement.availabilityZone : undefined,
			// ns: "10.0.1.27", //iset.dnsName,
			// ns: "ec2-54-242-217-186.compute-1.amazonaws.com",
			ns: typeof iset.dnsName == "string" ? iset.dnsName : null,
			type: iset.instanceType,
			startedAt: new Date(iset.launchTime),
			state: iset.instanceState ? iset.instanceState.name : "running",
			service: this.name,
			architecture: iset.architecture //x86_64
		};
	},

	/**
	 */

	"_mapIsetCallback": function(callback, ref) {
		var self = this;
		return outcome.error(callback).success(function(result) {
			var inst = ref ? dref.get(result, ref) : result;

			return callback(null, self._mapIset(inst));
		});
	}
});

module.exports.serviceName = "ec2";