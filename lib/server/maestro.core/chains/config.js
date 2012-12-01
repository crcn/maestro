var structr = require("structr"),
_ = require("underscore");

module.exports = structr({

	/**
	 */

	"__construct": function(serversChain) {
		this._serversChain = serversChain;
	}

});