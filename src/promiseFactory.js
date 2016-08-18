
var $promise = Symbol(),
$execute = Symbol('execute'),
$resolve = Symbol('resolve'),
$reject = Symbol('reject'),
$reset = Symbol('reset'),
$doJob = Symbol(),
$statePending = Symbol('pending'),
$stateResolved = Symbol('resolved'),
$stateRejected = Symbol('rejected'),
$reinitialization = Symbol('reinitialization'),
$promiseEnabled = Symbol('promiseEnabled'),
$activity = Symbol(),
$outOfUse = Symbol(),
$defaultMethodsNames = {
	execute: 'execute',
	resolve: 'resolve',
	reject: 'reject',
	reset: 'reset',
	then: 'then',
	"catch": 'catch',
	always: 'always',
	all: 'all',
	destroy: 'destroy',
	onDestroy: 'onDestroy',
	stop: 'stop'
};

class idlePromise {
	constructor() {
		
	}
}

var createDestroyerFor = new Function('p', 'return "function"===typeof p.destroy ? function() { p.destroy(); } : new Function()');

function createSubResolver(handler, resolve, reject, destroy) {
	var subRes = function subResolver(result) {
		try {
			var thenResult = handler(result);
			if ("object"===typeof thenResult && (thenResult instanceof Promise || thenResult instanceof idlePromise)) {
				thenResult[!(thenResult instanceof idlePromise) ? 'then' : thenResult.$_customizedMethodsNames.then](function(result) {
					resolve(result);
				});

				thenResult[!(thenResult instanceof idlePromise) ? 'catch' : thenResult.$_customizedMethodsNames['catch']](function(e) {
					reject(e);
				});
			} else {
				resolve(thenResult);
			}
		} catch(e) {
			reject(e);
		}
	};
	subRes.reject = reject;
	subRes.destroy = destroy;
	return subRes;
};



export default function promiseFactory({
		immediate = false, 
		perpetual = false, 
		autorun = true, 
		external = false, 
		chaining = true, 
		searchOutOfUse = false,
		methodsNames = {}
	}) {

	var $_customizedMethodsNames = {};
	for (var prop in $defaultMethodsNames) {
		if ($defaultMethodsNames.hasOwnProperty(prop)) {
			$_customizedMethodsNames[prop] = methodsNames.hasOwnProperty(prop) ? methodsNames[prop] : $defaultMethodsNames[prop];
		}
	}

	var CustomizedPromise;

	var methods = Object.create(idlePromise.prototype, {
		constructor: {
			value: function(resolver) {
				this[$reinitialization](autorun, resolver);

				Object.defineProperty(this, '$_customizedMethodsNames', {
					writable: false,
					enumerable: false,
					configurable: false,
					value: $_customizedMethodsNames
				})
				if (searchOutOfUse) {
					var e = new Error();
					this[$outOfUse] = {
						callback: new Function('console.warn("Unused Promise found", "' + e.stack.replace(/[\n\r]/g, " ") + '")')
					}
					this[$activity]();
				}
				if (autorun) this[$execute]();
			}
		},
		[$activity]: {
			value: function() {
				clearTimeout(this[$outOfUse].timer);
				this[$outOfUse].timer = setTimeout(this[$outOfUse].callback, 10000);
			}
		},
		[$reinitialization]: {
			value: function(autorun, resolver) {
				this[$promiseEnabled] = true;
				this[$promise] = {
					state: $statePending,
					resolver: resolver || null,
					fulfillReactions: [],
					rejectReactions: [],
					result: null, // Result value
					destroyHandlers: [],
					rejectionHandled: false
				}
			}
		},
		/*
		Execute resolver
		*/
		[$execute]: {
			value: function(resolver) {

				if ("function"===typeof resolver) this[$promise].resolver = resolver;

				if ("function"===typeof this[$promise].resolver) {
					
					try {
						this[$promise].resolver(this[$resolve].bind(this), this[$reject].bind(this));
					} catch(e) {
						this[$reject](e);
					}
				} else if (!external) {
					throw new Error("Promise requires resolver"); return;
				}
				
				return this;
			}
		},
		[$resolve]: {
			value: function(result) {
				if (!this[$promiseEnabled]) return null;
				if (searchOutOfUse) this[$activity]();
				let jobs = [];

				if (!perpetual && this[$promise].state !== $statePending) { 
					throw new Error("Promise can not be resolved second time. To use multiple resolvings compile Promise with option perpetual = true."); return null; 
				}

				this[$promise].state = $stateResolved;
				this[$promise].result = result;
				
				for (let reaction of this[$promise].fulfillReactions) {
					// Create high-order handler to make sure that result will be actual
					jobs.push(() => { reaction.call(this, result) });
				}
				if (!perpetual || !this[$promiseEnabled]) this[$promise].fulfillReactions = []; // Clear if not staying alive
				this[$doJob](jobs);
			}
		},
		[$reject]: {
			value: function(e) {
				if (!this[$promiseEnabled]) return null;
				if (searchOutOfUse) this[$activity]();
				this[$promise].rejectionHandled = false;
				let jobs = [];
				if (!perpetual && this[$promise].state !== $statePending) { throw new Error("Promise can not be rejected second time. To use multiple rejectings compile Promise with option perpetual = true."); return null; }

				this[$promise].state = $stateRejected;
				this[$promise].result = e;
				for (let reaction of this[$promise].rejectReactions) {
					// Create high-order handler to make sure that result will be actual
					jobs.push(function() { reaction.call(this, e) });
				}
				if (!perpetual || !this[$promiseEnabled]) this[$promise].rejectReactions = []; // Clear if not staying alive
				
				if (jobs.length>0) {
					this[$doJob](jobs, true);
				} else {
					// Make sure that exception will be handling
					if (this[$promise].fulfillReactions.length===0) {
						setTimeout(function() {
							if (!this[$promise].rejectionHandled) {
								console["function"===typeof console.error ? 'error' : 'log']("Unhandled Promise rejection", e);
							}
						}.bind(this));
					} else {
						// Reject all middleware Promises from then
						for (let reaction of this[$promise].fulfillReactions) {
							reaction.reject(e);
						}
					}
				}
				
			}
		},
		[$reset]: {
			value: function() {
				this[$promise].state = $statePending;
				this[$promise].result = null;
				return this;
			}
		},
		/*
		After resolving (or rejecting) all reactions will be called in the next tick
		*/
		[$doJob]: {
			value: function(jobs, rejection = false) {
				/*
				Rejection can not be hidden from developer
				*/
				
				let jobList = function(result) {
					if (!this[$promiseEnabled]) return;
					for (var i =0;i<jobs.length;++i) {
						jobs[i].call(this, result);
						jobs.splice(i, 1);
						i--;
					}
				}
				if (immediate) jobList();
				else setTimeout(jobList.bind(this, this[$promise].result), 0);
			}
		},
		[$_customizedMethodsNames.execute]: {
			value: function(resolver) {
				if (!(external || autorun)) { throw new Error("Method execute() is not aviable from outside"); return null; }
				this[$execute](resolver);
				return this;
			}
		},
		[$_customizedMethodsNames.resolve]: {
			value: function(value) {
				if (!external) { throw new Error("Method resolve() is not aviable from outside"); return null; }
				this[$resolve](value);
				return this;
			}
		},
		[$_customizedMethodsNames.reject]: {
			value: function(e) {
				if (!external) { throw new Error("Method reject() is not aviable from outside"); return null; }
				this[$reject](e);
				return this;
			}
		},
		[$_customizedMethodsNames.reset]: {
			value: function() {
				if (!external) { throw new Error("Method reset() is not aviable from outside"); return null; }
				this[$reset]();
			}
		},
		/**
		Erase all reactions and disable perpetual mode if enabled
		**/
		[$_customizedMethodsNames.destroy]: {
			value: function() {
				if (this.hasOwnProperty("destroyed")) return;
				this.destroyed = true;
				this[$_customizedMethodsNames.stop]();
				this[$reset]();
				for (let handler of this[$promise].destroyHandlers) {
					handler();
				}
				/* Destroys all child Promises */
				for (let reaction of this[$promise].fulfillReactions) {
					if ("function"===typeof reaction.destroy) reaction.destroy();
				}
				for (let reaction of this[$promise].rejectReactions) {
					if ("function"===typeof reaction.destroy) reaction.destroy();
				}
				this[$promise].fulfillReactions = [];
				this[$promise].rejectReactions = [];
				this[$reinitialization]();
				for (var i in this) {
					if (this.hasOwnProperty(i)) {
						this[i] = null;
					}
				}
			}
		},
		/*
		Allow you to specify custon handler on destroy action
		*/
		[$_customizedMethodsNames.onDestroy]: {
			value: function(customHandler) {
				this[$promise].destroyHandlers.push(customHandler);
			}
		},
		/*
		Stop machine! Disable resolve and reject methods. New values will be not received.
		*/
		[$_customizedMethodsNames.stop]: {
			value: function() {
				this[$promiseEnabled] = false;
			}
		},
		[$_customizedMethodsNames.then]: {
			value: function(onResolved = false, onRejected = false) {

				var promise = new CustomizedPromise((resolve, reject) => {

					if ("function"===typeof onResolved) {
						let subResolver = createSubResolver(onResolved, resolve, reject, createDestroyerFor(this));
						if (this[$promise].state === $stateResolved) {
							this[$doJob]([
								subResolver
							]);
							if (perpetual) this[$promise].fulfillReactions.push(
								subResolver
							);
						} else {
							this[$promise].fulfillReactions.push(
								subResolver
							);
						}
					}

					if ("function"===typeof onRejected) {
						let subRejecter = createSubResolver(onRejected, resolve, reject, createDestroyerFor(this));
						if (this[$promise].state === $stateRejected) {
							/*
							If rejection has not handled by existing rejectReactions
							then it must inform to Promise that it did it now.
							*/
							this[$promise].rejectionHandled=true;
							this[$doJob]([
								subRejecter
							]);
							if (perpetual) this[$promise].rejectReactions.push(
								subRejecter
							);
						} else {
							this[$promise].rejectReactions.push(
								subRejecter
							);
						}
					}
				});

				if (!autorun) {
					promise[$execute]();
				}

				if (chaining)
				return promise;
				else
				return this;
			}
		},
		[$_customizedMethodsNames.catch]: {
			value: function(onRejected) {
				return this[$_customizedMethodsNames.then](false, onRejected);
			}
		},
		[$_customizedMethodsNames.always]: {
			value: function(onAlways) {
				return this[$_customizedMethodsNames.then](onAlways, onAlways);
			}
		},
		transform: {
			value: function(newConfiguration) {
				throw 'Method deprecated!';
				for (let key in newConfiguration) {
					if (newConfiguration.hasOwnProperty(key)) {
						switch(key) {
							case 'perpetual':
								perpetual = newConfiguration[key];
								this.perpetualDisabledBy = new Error('Perpetual disabled'); // TODO: Delete it after debugging
							break;
							case 'immediate':
								immediate = newConfiguration[key];
							break;
							case 'autorun':
								autorun = newConfiguration[key];
							break;
							case 'external':
								external = newConfiguration[key];
							break;
							case 'chaining':
								chaining = newConfiguration[key];
							break;
							case 'methodsNames':
								throw new Error('PromiseFactory is not supports changing methods names after factoring');
							break;
							default:
								throw new Error('Undefined configuration key: '+key);
							break;
						}
					}
					
				}
			}
		}
	});

	var methodAll = function (promises) {
		var allPromise = new CustomizedPromise(function(resolve, reject) {
			var results = Array(promises.length),
			resolved = Array(promises.length).fill(false),
			timer = 0;
			var validate = function() {
				if (resolved.filter((v) => !v).length===0) {
					resolve(results);
				}
			}
			promises.forEach(function(promise, index) {
				promise.then(function(result) {
					results[index] = result;
					resolved[index] = true;

					if (immediate) {
						validate();
					} else {
						clearTimeout(timer);
						timer = setTimeout(validate);
					}
					
				})
				.catch(function(e) {
					clearTimeout(timer);
					reject(e);
				});
			});
		});
		
		if (!autorun) allPromise[$execute]();

		return allPromise;
	};

	var directResolve = function(value) {
		return new CustomizedPromise(function(resolve) {
			resolve(value);
		});
	}

	var directReject = function(e) {
		return new CustomizedPromise(function(resolve, reject) {
			reject(e);
		});
	}

	class SupremeSubject {
		constructor() {
			this.backtracks = [];
			this.actual = true;
		}

		backtrack(destroyer) {
			if ("function"===typeof destroyer) this.backtracks.push(destroyer);
		}

		async(handler, late) {
			var supreme = this;
			return function(...args) { 
				if (supreme.actual)
				return handler(...args);
				else
				return "function"===typeof late ? late(...args) : null;
			}
		}

		destroy() {
			this.actual = false;
			this.backtracks.forEach(function(destroyer) {
				destroyer();
			});
			this.promise.destroy();
		}
	}

	var methodSupreme = function(resolver) {
		var supremeSubject = null;
		var decoratedResolver = function(...args) {
			if (null!==supremeSubject) {
				supremeSubject.destroy();
			}
			supremeSubject = new SupremeSubject();
			supremeSubject.promise = new CustomizedPromise(function(resolve, reject) {
				
				var returnedDestroyer = resolver.apply(this, 
					[resolve, reject, supremeSubject.backtrack.bind(supremeSubject), supremeSubject.async.bind(supremeSubject)]
					.concat(args)
				);
				if ("function"===typeof returnedDestroyer) supremeSubject.backtrack(returnedDestroyer);
			});

			if (!autorun) supremeSubject.promise[$execute]();

			return supremeSubject.promise;
		}

		return decoratedResolver;
	}

	if ("PROMISE_FACTORY_ES6"!=="PROMISE_FACTORY_ES6") {
		CustomizedPromise = function() {
			return methods.constructor.apply(this, Array.from(arguments));
		}

		CustomizedPromise.prototype = Object.create(methods);

		CustomizedPromise.all = methodAll;
		CustomizedPromise.supreme = methodSupreme;
		CustomizedPromise.resolve = directResolve;
		CustomizedPromise.reject = directReject;
		
	} else {
		CustomizedPromise = class CustomizedPromise extends idlePromise {

			static all(promises) {
				return methodAll.apply(this, Array.from(arguments));
			}

			static resolve(value) {
				return directResolve.apply(this, Array.from(arguments));
			}

			static reject(e) {
				return directReject.apply(this, Array.from(arguments));
			}

            static supreme() {
                return methodSupreme.apply(this, Array.from(arguments));
            }

			constructor(resolver) {
				super();
				return methods.constructor.apply(this, Array.from(arguments));
			}

			[$reinitialization](autorun, resolver) {
				return methods[$reinitialization].apply(this, Array.from(arguments));
			}

			/*
			Execute resolver
			*/
			[$execute](resolver) {
				return methods[$execute].apply(this, Array.from(arguments));
			}

			[$resolve](result) {
				return methods[$resolve].apply(this, Array.from(arguments));
			}

			[$reject](e) {
				return methods[$reject].apply(this, Array.from(arguments));
			}

			[$reset]() {
				return methods[$reset].apply(this, Array.from(arguments));
			}

			/*
			After resolving (or rejecting) all reactions will be called in the next tick
			*/
			[$doJob](jobs, rejection = false) {
				return methods[$doJob].apply(this, Array.from(arguments));
			}

			[$activity]() {
				return methods[$activity].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.execute](resolver) {
				return methods[$_customizedMethodsNames.execute].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.resolve](value) {
				return methods[$_customizedMethodsNames.resolve].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.reject](e) {
				return methods[$_customizedMethodsNames.reject].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.reset]() {
				return methods[$_customizedMethodsNames.reset].apply(this, Array.from(arguments));
			}
			/**
			Erase all reactions and disable perpetual mode if enabled
			**/
			[$_customizedMethodsNames.destroy]() {
				return methods[$_customizedMethodsNames.destroy].apply(this, Array.from(arguments));
			}
			/*
			Allow you to specify custon handler on destroy action
			*/
			[$_customizedMethodsNames.onDestroy](customHandler) {
				return methods[$_customizedMethodsNames.onDestroy].apply(this, Array.from(arguments));
			}
			/*
			Stop machine! Disable resolve and reject methods. New values will be not received.
			*/
			[$_customizedMethodsNames.stop]() {
				return methods[$_customizedMethodsNames.stop].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.then](onResolved = false, onRejected = false) {
				return methods[$_customizedMethodsNames.then].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.always]() {
				return methods[$_customizedMethodsNames.always].apply(this, Array.from(arguments));
			}

			[$_customizedMethodsNames.catch](onRejected) {
				return methods[$_customizedMethodsNames.catch].apply(this, Array.from(arguments));
			}

			transform(newConfiguration) {
				return methods.transform(false, onRejected);
			}
		}
	}

	return CustomizedPromise;
}