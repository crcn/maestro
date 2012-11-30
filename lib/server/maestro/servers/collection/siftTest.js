var sift = require("sift");

module.exports = function(query) {

	var sifter = sift(query);

	return function(server) {
		return sifter.test(server.info);
	};
}