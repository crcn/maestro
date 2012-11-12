var tq = require("tq");
exports.name = "step";
exports.type = "operator";
exports.factory = function(that, property, value) {

	that.step = function(fn, args) {


		//multiple functions provided? loop through tnem
		if(typeof arguments[0] == "function" && typeof arguments[1] == "function") {
			for(var i = 0, n = arguments.length; i < n; i++) {
				this.step(arguments[i]);
			}
			return this;
		}

		//is the function passed a stepper? skip it, it's already queued
		if(fn.stepper) {
			return fn();
		}

		if(!this._cqueue || this._stepping) {
			var depth = this._cqueue ? this._cqueue.depth : 0;
			this._cqueue = tq.queue().start();
			this._cqueue.depth = depth + 1;
			this._stepping = false;
		}


		var cqueue = this._cqueue, 
		pqueue = cqueue,
		self = this;



		// console.log(cqueue.depth)
		cqueue.push(function() {

			//use the arguments passed in the stepper vs this queue
			if(!args) args = Array.prototype.slice.call(arguments, 0);
			var next = this,
			finished = false;

			//grab the last arg. Since we're dealing with async functions, we can expect
			//the last arg to be a function.
			var lastArg = args.length ? args[args.length - 1] : null,
			pFn = function(){};

			if(typeof lastArg == "function") {
				pFn = lastArg;
			}


			var step = args[fn.length - 1] = function() {

				args = arguments;

				function childrenComplete() {

					pFn.apply(self, args);


					if(!finished) {
						finished = true;
						next.apply(self, args);
					}
				}


				//current queue does not match up with THIS queue?
				//multiple async functions have been called then. Make
				//sure they're finished before continuing
				if(self._cqueue != cqueue) {

					var pqueue = self._cqueue;

					function wait() {
						console.log("WAIT")
						pqueue.push(function() {
							if(self._cqueue.stack.length) {
								wait();
								this();
								return;
							}

							childrenComplete();
							self._cqueue = cqueue;
							this();
						});

					}

					wait();
				//otherwise, we're done!
				} else {
					childrenComplete();
				}

			};


			//set the current callback
			step.stepper = true;

			self._stepping = true;
			fn.apply(self, args);
			self._stepping = false;
		});


		return this;
	}


	return function() {
		return this.step(value, arguments);
	}
}