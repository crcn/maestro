var structr = require("structr"),
sift = require("sift"),
siftTest = require("./siftTest");

module.exports = structr({

	/**
	 */

	"__construct": function() {
		this._listeners = {};
	},

	/**
	 */

	"emit": function(type, data) {
		this._emit(type, data);
		this._emit("change", data);
	},

	/**
	 */

	"_emit": function(type, data) {
		var listeners = this._listeners[type] || [];
		for(var i = listeners.length; i--;) {
			var listener = listeners[i];
			if(listener.test(data)) {
				listener.callback(data);
			}
		}
	},

	/**
	 */

	"on": function(query, type, callback) {
		if(typeof type == "object") {
			for(var t in type) {
				this.on(t, t, t[type]);
			}
			return;
		}
		if(!this._listeners[type]) this._listeners[type] = [];
		
		this._listeners[type].push({
			test: siftTest(query),
			callback: callback
		});
	}
});