var structr = require("structr"),
aws         = require("aws-lib"),
outcome     = require("outcome"),
_ = require("underscore"),
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
				console.log("registering AIM %s", image.name);

				var im = {
					_id: image.imageId,
					name: image.name
				};

				self._images[im._id] = im;
				self._images[im.name] = im;
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

	"terminateServer": function(server, callback) {
		this._callIsetMethod(server, "TerminateInstances", null, callback);
	},

	/**
	 */

	"step cloneServer": function(server, callback) {
		this.createServer({
			imageId: server.get("image._id"),
			type: server.get("type")
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

		console.log("creating new server id=%s type=%s", options.imageId, options.type);


		var self = this;
		this._ec2.call("RunInstances", this._removeUndef({
			"ImageId": dref.get(self._images, options.imageName + "._id") || options.imageId,
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
		// console.log("%s: %s %s", this.name, method, server.get("_id"));
		this._ec2.call(method, { "InstanceId.1": server.get("_id") }, this._mapIsetCallback(callback, ref)); 
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

		/*return {

			//necessary
			_id: iset.instanceId,
			image: this._images[iset.imageId],
			gateway: typeof iset.dnsName == "string" ? iset.dnsName : null,
			state: iset.instanceState ? iset.instanceState.name : "running",

			//extra
			startedAt: new Date(iset.launchTime),
			zone: iset.placement ? iset.placement.availabilityZone : undefined,
			service: this.name,
			architecture: iset.architecture

		}*/

		return {
			_id: iset.instanceId, 
			image: this._images[iset.imageId] || { _id: iset.imageId },
			zone: iset.placement ? iset.placement.availabilityZone : undefined,
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