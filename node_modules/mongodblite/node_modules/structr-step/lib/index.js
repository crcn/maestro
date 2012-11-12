var tq = require("tq");

exports.name = "step";
exports.type = "operator";
exports.factory = function(that, property, value) {

	if(!that.step) {
		that.step = function(fn) {

			//more than one function to step? add all of them onto the stepping function
			if(arguments.length > 1) {
				for(var i = 0, n = arguments.length; i < n; i++) {
					this.step(arguments[i]);
				}
				return this;
			}

			//this will be called if an async function is called for the first time, OR
			//if an async function is called WITHIN an async function
			if(!this._cqueue || this._callingStepper) {
				this._cqueue         = tq.queue().start();
				this._callingStepper = false;
			}

			var self = this;



			this._cqueue.push(function() {

				var args = Array.prototype.slice.apply(arguments);
				args[fn.length - 1] = this;


				//we're about to enter an async function, so keep tabs on the OLD queue so we can
				//reset it *after* the async function exits
				var oldQueue = self._cqueue;

				//flag the class so that the current queue gets overwritten if another async function
				//is called within this one. 
				self._callingStepper = true;

				fn.apply(self, args);

				//we've exited out of the function, so remove the flag
				self._callingStepper = false;

				//reset the old queue 
				self._cqueue         = oldQueue;
			});

			return this;
		}
	}


	return function() {


		var args = Array.prototype.slice.apply(arguments),
		tole = typeof args[args.length - 1],
		orgNext;

		if(tole == "function" || tole == "undefined") {
			orgNext = args.pop();
		}

		if(!orgNext) {
			orgNext = function(){};
		}


		return this.step(function(nextQueuedFn) {

			args[value.length - 1] = function() {
				orgNext.apply(this, arguments);
				nextQueuedFn();
			};


			value.apply(this, args);
		});
	}
}