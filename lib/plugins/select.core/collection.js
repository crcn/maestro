var structr = require("structr"),
_ = require("underscore");

module.exports = structr({

	/**
	 */

	"__construct": function(source) {
		this._source = source;
	},

	/**
	 */

	"getSelector": function(select) {
		for(var i = this._source.length; i--;) {
			if(this._source[i].test(select)) {
				return new this._source[i](select);
			}
		}
	}
});