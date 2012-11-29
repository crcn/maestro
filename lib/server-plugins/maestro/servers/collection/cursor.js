var collectionSorter = require("./collectionSorter"),
siftTest = require("./siftTest"),
structr = require("structr");

module.exports = structr({

	/**
	 */

	"__construct": function(collection) {
		this.collection = collection;
		this.options = {};
	},

	/**
	 */

	"limit": function(value) {
		this.options.limit = value;
		return this;
	},


	/**
	 */

	"skip": function(value) {
		this.options.skip = value;
		return this;
	},

	/**
	 */

	"query": function(value) {
		this.options.query = value;
		return this;
	},

	/**
	 */

	"sort": function(value) {
		this.options.sort = value;
		return this;
	},

	/**
	 */

	"execSync": function() {


		var ops = this.options,
		result = this.collection._servers.filter(siftTest(ops.query));
		

		if(typeof ops.sort != undefined) {
			result = collectionSorter.sort(ops.sort, result);
		}

		if(typeof ops.limit != undefined) {
			result = result.slice(ops.skip || 0, ops.limit);
		}

		return result;
	}
});
