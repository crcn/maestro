var mongoose = require("mongoose");

exports.plugin = function(loader) {
	var mdb = loader.params("mongodb");
	return typeof mdb == "object" ? mdb : mongoose.createConnection(mdb);
}