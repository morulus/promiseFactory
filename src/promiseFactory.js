/**
Configurable factory of Promise

Usage:
var MyPromise = promiseFactory({
	// any options
});

var deferedResult = new MyPromise(function(resolve, reject) {
	
});

Aviable options:
- immediate default false: then/catch handler will called immediate (withaut waiting next tick)
- perpetual default false: after resolving Promise will not died. Next resolve() reject() callings will be processed as well
- autorun default true: main resolver will not executed in constructor (to execute it call execute() method)
- external default false: Promised object will have outside methods object.resolve() and object.reject()
- chaining default true: enable/disable chaining. Without chaining then() and catch() always return first Promise

Perpetial example:
var MyPromise = promiseFactory({
	perpetual: true
});

var deferedResult = new MyPromise(function(resolve, reject) {
	resolve(1);
	setTimeout(() => resolve(2), 1000);
});

deferedResult.then(function(result) {
	// Will be 1
	// And will be 2 after 1000 ms
});

Disabling autorun example
var MyPromise = promiseFactory({
	autorun: false
});

var deferedResult = new MyPromise(function(resolve, reject) {
	resolve(1);
});

deferedResult.then(function(result) {
	// Handler will not called yet
});

deferedResult.execute(); // Force execute resolver

External api example:
var deferedResult = new MyPromise();

deferedResult.then(function(result) {
	// Will be 1
});

deferedResult.resolve(1);

Disabling chaining example:
var MyPromise = promiseFactory({
	chaining: false
});

var deferedResult = new MyPromise(function(resolve, reject) {
	resolve(1);
});
deferedResult
.then(function(result) {
	// Result will be 1
	return 2;
})
.then(function(resule) {
	// Result will be 1 because chaning disabled
});


Using as parent class:

class MyEngine extends promiseFactory({
	perpetual: true,
	autorun: false,
	external: true
}) {
	constructor() {
		super();
	}

	calculate() {
		this.resolve('My results');
	}
}

var engine = new MyEngine();
MyEngine.calculate();
MyEngine.then(function() { });
**/
if ("object"===typeof window && "function"!==typeof window.Symbol) window.Symbol = require('es6-symbol');

var $promise = Symbol,
$execute = Symbol('execute'),
$resolve = Symbol('resolve'),
$reject = Symbol('reject'),
$doJob = Symbol(),
$statePending = Symbol('pending'),
$stateResolved = Symbol('resolved'),
$stateRejected = Symbol('rejected'),
$reinitialization = Symbol('reinitialization'),
$defaultMethodsNames = {
	execute: 'execute',
	resolve: 'resolve',
	reject: 'reject',
	reset: 'reset',
	then: 'then',
	"catch": 'catch',
	all: 'all',
	destroy: 'destroy',
	onDestroy: 'onDestroy',
	stop: 'stop'
};

class idlePromise {
	constructor() {
		
	}
}

function createSubResolver(handler, resolve, reject) {
	return function subResolver(result) {
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
};



export default function promiseFactory({
		immediate = false, 
		perpetual = false, 
		autorun = true, 
		external = false, 
		chaining = true, 
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

				if (autorun) this[$execute]();
			}
		},
		[$reinitialization]: {
			value: function(autorun, resolver) {
				this[$promise] = {
					state: $statePending,
					resolver: resolver || null,
					fulfillReactions: [],
					rejectReactions: [],
					result: null, // Result value
					stopped: false,
					destroyHandlers: []
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
				if (this[$promise].stopped) return null;
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
				if (!perpetual || this[$promise].stopped) this[$promise].fulfillReactions = []; // Clear if not staying alive
				this[$doJob](jobs);
			}
		},
		[$reject]: {
			value: function(e) {
				if (this[$promise].stopped) return null;
				let jobs = [];
				if (!perpetual && this[$promise].state !== $statePending) { throw new Error("Promise can not be rejected second time. To use multiple rejectings compile Promise with option perpetual = true."); return null; }

				this[$promise].state = $stateRejected;
				this[$promise].result = e;
				for (let reaction of this[$promise].rejectReactions) {
					// Create high-order handler to make sure that result will be actual
					jobs.push(function() { reaction.call(this, e) });
				}
				if (!perpetual || this[$promise].stopped) this[$promise].rejectReactions = []; // Clear if not staying alive
				
				this[$doJob](jobs, true);
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
				
				let jobList = () => {
					for (var i =0;i<jobs.length;++i) {
						jobs[i].call(this, this[$promise].result);
						jobs.splice(i, 1);
						i--;
					}
				}
				if (immediate) jobList();
				else setTimeout(jobList, 0);
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
				this[$promise].state = $statePending;
				this[$promise].result = null;
				return this;
			}
		},
		/**
		Erase all reactions and disable perpetual mode if enabled
		**/
		[$_customizedMethodsNames.destroy]: {
			value: function() {
				this[$_customizedMethodsNames.stop]();
				this[$_customizedMethodsNames.reset]();
				for (let handler of this[$promise].destroyHandlers) {
					handler();
				}
				this[$reinitialization]();
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
				this[$promise].stopped = true;
			}
		},
		[$_customizedMethodsNames.then]: {
			value: function(onResolved = false, onRejected = false) {

				var promise = new CustomizedPromise((resolve, reject) => {

					if ("function"===typeof onResolved) {
						let subResolver = createSubResolver(onResolved, resolve, reject);
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
						let subRejecter = createSubResolver(onRejected, resolve, reject);
						if (this[$promise].state === $stateRejected) {
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

	if (PROMISE_FACTORY_ES5) {
		CustomizedPromise = function() {
			return methods.constructor.apply(this, Array.from(arguments));
		}

		CustomizedPromise.prototype = Object.create(methods);

		CustomizedPromise.all = methodAll;
		
	} else {
		CustomizedPromise = class CustomizedPromise extends idlePromise {

			static all(promises) {
				return methodAll.apply(this, Array.from(arguments));
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

			/*
			After resolving (or rejecting) all reactions will be called in the next tick
			*/
			[$doJob](jobs, rejection = false) {
				return methods[$doJob].apply(this, Array.from(arguments));
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