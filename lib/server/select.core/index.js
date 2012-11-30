var Collection = require("./collection");

exports.require = [["select.part.*"]];
exports.plugin = function(selectors) {
	return new Collection(selectors);
}