module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.default = promiseFactory;

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
	if ("object" === (typeof window === "undefined" ? "undefined" : _typeof(window)) && "function" !== typeof window.Symbol) window.Symbol = __webpack_require__(1);

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

	var idlePromise = function idlePromise() {
		_classCallCheck(this, idlePromise);
	};

	function createSubResolver(handler, resolve, reject) {
		return function subResolver(result) {
			try {
				var thenResult = handler(result);
				if ("object" === (typeof thenResult === "undefined" ? "undefined" : _typeof(thenResult)) && (thenResult instanceof Promise || thenResult instanceof idlePromise)) {
					thenResult[!(thenResult instanceof idlePromise) ? 'then' : thenResult.$_customizedMethodsNames.then](function (result) {
						resolve(result);
					});

					thenResult[!(thenResult instanceof idlePromise) ? 'catch' : thenResult.$_customizedMethodsNames['catch']](function (e) {
						reject(e);
					});
				} else {
					resolve(thenResult);
				}
			} catch (e) {
				reject(e);
			}
		};
	};

	function promiseFactory(_ref) {
		var _methods;

		var _ref$immediate = _ref.immediate;
		var immediate = _ref$immediate === undefined ? false : _ref$immediate;
		var _ref$perpetual = _ref.perpetual;
		var perpetual = _ref$perpetual === undefined ? false : _ref$perpetual;
		var _ref$autorun = _ref.autorun;
		var autorun = _ref$autorun === undefined ? true : _ref$autorun;
		var _ref$external = _ref.external;
		var external = _ref$external === undefined ? false : _ref$external;
		var _ref$chaining = _ref.chaining;
		var chaining = _ref$chaining === undefined ? true : _ref$chaining;
		var _ref$methodsNames = _ref.methodsNames;
		var methodsNames = _ref$methodsNames === undefined ? {} : _ref$methodsNames;


		var $_customizedMethodsNames = {};
		for (var prop in $defaultMethodsNames) {
			if ($defaultMethodsNames.hasOwnProperty(prop)) {
				$_customizedMethodsNames[prop] = methodsNames.hasOwnProperty(prop) ? methodsNames[prop] : $defaultMethodsNames[prop];
			}
		}

		var CustomizedPromise;

		var methods = (_methods = {
			constructor: function constructor(resolver) {
				this[$reinitialization](autorun, resolver);

				Object.defineProperty(this, '$_customizedMethodsNames', {
					writable: false,
					enumerable: false,
					configurable: false,
					value: $_customizedMethodsNames
				});

				this[$execute]();
			}
		}, _defineProperty(_methods, $reinitialization, function (autorun, resolver) {
			this[$promise] = {
				state: $statePending,
				resolver: resolver || null,
				fulfillReactions: [],
				rejectReactions: [],
				result: null, // Result value
				stopped: false,
				destroyHandlers: []
			};
		}), _defineProperty(_methods, $execute, function (resolver) {

			if ("function" === typeof resolver) this[$promise].resolver = resolver;

			if ("function" === typeof this[$promise].resolver) {

				try {
					this[$promise].resolver(this[$resolve].bind(this), this[$reject].bind(this));
				} catch (e) {
					this[$reject](e);
				}
			} else if (!external) {
				throw new Error("Promise requires resolver");return;
			}

			return this;
		}), _defineProperty(_methods, $resolve, function (result) {
			var _this = this;

			if (this[$promise].stopped) return null;
			var jobs = [];

			if (!perpetual && this[$promise].state !== $statePending) {
				throw new Error("Promise can not be resolved second time. To use multiple resolvings compile Promise with option perpetual = true.");return null;
			}

			this[$promise].state = $stateResolved;
			this[$promise].result = result;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				var _loop = function _loop() {
					var reaction = _step.value;

					// Create high-order handler to make sure that result will be actual
					jobs.push(function () {
						reaction.call(_this, result);
					});
				};

				for (var _iterator = this[$promise].fulfillReactions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					_loop();
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			if (!perpetual || this[$promise].stopped) this[$promise].fulfillReactions = []; // Clear if not staying alive
			this[$doJob](jobs);
		}), _defineProperty(_methods, $reject, function (e) {
			if (this[$promise].stopped) return null;
			var jobs = [];
			if (!perpetual && this[$promise].state !== $statePending) {
				throw new Error("Promise can not be rejected second time. To use multiple rejectings compile Promise with option perpetual = true.");return null;
			}

			this[$promise].state = $stateRejected;
			this[$promise].result = e;
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				var _loop2 = function _loop2() {
					var reaction = _step2.value;

					// Create high-order handler to make sure that result will be actual
					jobs.push(function () {
						reaction.call(this, e);
					});
				};

				for (var _iterator2 = this[$promise].rejectReactions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					_loop2();
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			if (!perpetual || this[$promise].stopped) this[$promise].rejectReactions = []; // Clear if not staying alive

			this[$doJob](jobs, true);
		}), _defineProperty(_methods, $doJob, function (jobs) {
			var _this2 = this;

			var rejection = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			/*
	  Rejection can not be hidden from developer
	  */

			var jobList = function jobList() {
				for (var i = 0; i < jobs.length; ++i) {
					jobs[i].call(_this2, _this2[$promise].result);
					jobs.splice(i, 1);
					i--;
				}
			};
			if (immediate) jobList();else setTimeout(jobList, 0);
		}), _defineProperty(_methods, $_customizedMethodsNames.execute, function (resolver) {
			if (!(external || autorun)) {
				throw new Error("Method execute() is not aviable from outside");return null;
			}
			this[$execute](resolver);
			return this;
		}), _defineProperty(_methods, $_customizedMethodsNames.resolve, function (value) {
			if (!external) {
				throw new Error("Method resolve() is not aviable from outside");return null;
			}
			this[$resolve](value);
			return this;
		}), _defineProperty(_methods, $_customizedMethodsNames.reject, function (e) {
			if (!external) {
				throw new Error("Method reject() is not aviable from outside");return null;
			}
			this[$reject](e);
			return this;
		}), _defineProperty(_methods, $_customizedMethodsNames.reset, function () {
			if (!external) {
				throw new Error("Method reset() is not aviable from outside");return null;
			}
			this[$promise].state = $statePending;
			this[$promise].result = null;
			return this;
		}), _defineProperty(_methods, $_customizedMethodsNames.destroy, function () {
			this[$_customizedMethodsNames.stop]();
			this[$_customizedMethodsNames.reset]();
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this[$promise].destroyHandlers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var handler = _step3.value;

					handler();
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			this[$reinitialization]();
		}), _defineProperty(_methods, $_customizedMethodsNames.onDestroy, function (customHandler) {
			this[$promise].destroyHandlers.push(customHandler);
		}), _defineProperty(_methods, $_customizedMethodsNames.stop, function () {
			this[$promise].stopped = true;
		}), _defineProperty(_methods, $_customizedMethodsNames.then, function () {
			var _this3 = this;

			var onResolved = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
			var onRejected = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


			var promise = new CustomizedPromise(function (resolve, reject) {

				if ("function" === typeof onResolved) {
					var subResolver = createSubResolver(onResolved, resolve, reject);
					if (_this3[$promise].state === $stateResolved) {
						_this3[$doJob]([subResolver]);
						if (perpetual) _this3[$promise].fulfillReactions.push(subResolver);
					} else {
						_this3[$promise].fulfillReactions.push(subResolver);
					}
				}

				if ("function" === typeof onRejected) {
					var subRejecter = createSubResolver(onRejected, resolve, reject);
					if (_this3[$promise].state === $stateRejected) {
						_this3[$doJob]([subRejecter]);
						if (perpetual) _this3[$promise].rejectReactions.push(subRejecter);
					} else {
						_this3[$promise].rejectReactions.push(subRejecter);
					}
				}
			});

			if (!autorun) {
				promise[$execute]();
			}

			if (chaining) return promise;else return this;
		}), _defineProperty(_methods, $_customizedMethodsNames.catch, function (onRejected) {
			return this[$_customizedMethodsNames.then](false, onRejected);
		}), _defineProperty(_methods, "transform", function transform(newConfiguration) {
			throw 'Method deprecated!';
			for (var key in newConfiguration) {
				if (newConfiguration.hasOwnProperty(key)) {
					switch (key) {
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
							throw new Error('Undefined configuration key: ' + key);
							break;
					}
				}
			}
		}), _methods);

		var methodAll = function methodAll(promises) {
			var allPromise = new CustomizedPromise(function (resolve, reject) {
				var results = Array(promises.length),
				    resolved = Array(promises.length).fill(false),
				    timer = 0;
				var validate = function validate() {
					if (resolved.filter(function (v) {
						return !v;
					}).length === 0) {
						resolve(results);
					}
				};
				promises.forEach(function (promise, index) {
					promise.then(function (result) {
						results[index] = result;
						resolved[index] = true;

						if (immediate) {
							validate();
						} else {
							clearTimeout(timer);
							timer = setTimeout(validate);
						}
					}).catch(function (e) {
						clearTimeout(timer);
						reject(e);
					});
				});
			});

			if (!autorun) allPromise[$execute]();

			return allPromise;
		};

		CustomizedPromise = function (_idlePromise) {
			_inherits(CustomizedPromise, _idlePromise);

			_createClass(CustomizedPromise, null, [{
				key: "all",
				value: function all(promises) {
					return methodAll.apply(this, Array.from(arguments));
				}
			}]);

			function CustomizedPromise(resolver) {
				var _ret3;

				_classCallCheck(this, CustomizedPromise);

				var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(CustomizedPromise).call(this));

				return _ret3 = methods.constructor.apply(_this4, Array.from(arguments)), _possibleConstructorReturn(_this4, _ret3);
			}

			_createClass(CustomizedPromise, [{
				key: $reinitialization,
				value: function value(autorun, resolver) {
					return methods[$reinitialization].apply(this, Array.from(arguments));
				}

				/*
	   Execute resolver
	   */

			}, {
				key: $execute,
				value: function value(resolver) {
					return methods[$execute].apply(this, Array.from(arguments));
				}
			}, {
				key: $resolve,
				value: function value(result) {
					return methods[$resolve].apply(this, Array.from(arguments));
				}
			}, {
				key: $reject,
				value: function value(e) {
					return methods[$reject].apply(this, Array.from(arguments));
				}

				/*
	   After resolving (or rejecting) all reactions will be called in the next tick
	   */

			}, {
				key: $doJob,
				value: function value(jobs) {
					var rejection = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

					return methods[$doJob].apply(this, Array.from(arguments));
				}
			}, {
				key: $_customizedMethodsNames.execute,
				value: function value(resolver) {
					return methods[$_customizedMethodsNames.execute].apply(this, Array.from(arguments));
				}
			}, {
				key: $_customizedMethodsNames.resolve,
				value: function value(_value) {
					return methods[$_customizedMethodsNames.resolve].apply(this, Array.from(arguments));
				}
			}, {
				key: $_customizedMethodsNames.reject,
				value: function value(e) {
					return methods[$_customizedMethodsNames.reject].apply(this, Array.from(arguments));
				}
			}, {
				key: $_customizedMethodsNames.reset,
				value: function value() {
					return methods[$_customizedMethodsNames.reset].apply(this, Array.from(arguments));
				}
				/**
	   Erase all reactions and disable perpetual mode if enabled
	   **/

			}, {
				key: $_customizedMethodsNames.destroy,
				value: function value() {
					return methods[$_customizedMethodsNames.destroy].apply(this, Array.from(arguments));
				}
				/*
	   Allow you to specify custon handler on destroy action
	   */

			}, {
				key: $_customizedMethodsNames.onDestroy,
				value: function value(customHandler) {
					return methods[$_customizedMethodsNames.onDestroy].apply(this, Array.from(arguments));
				}
				/*
	   Stop machine! Disable resolve and reject methods. New values will be not received.
	   */

			}, {
				key: $_customizedMethodsNames.stop,
				value: function value() {
					return methods[$_customizedMethodsNames.stop].apply(this, Array.from(arguments));
				}
			}, {
				key: $_customizedMethodsNames.then,
				value: function value() {
					var onResolved = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
					var onRejected = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

					return methods[$_customizedMethodsNames.then].apply(this, Array.from(arguments));
				}
			}, {
				key: $_customizedMethodsNames.catch,
				value: function value(onRejected) {
					return methods[$_customizedMethodsNames.catch].apply(this, Array.from(arguments));
				}
			}, {
				key: "transform",
				value: function transform(newConfiguration) {
					return methods.transform(false, onRejected);
				}
			}]);

			return CustomizedPromise;
		}(idlePromise);

		return CustomizedPromise;
	}
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(2)() ? Symbol : __webpack_require__(3);


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var validTypes = { object: true, symbol: true };

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }

		// Return 'true' also for polyfills
		if (!validTypes[typeof Symbol.iterator]) return false;
		if (!validTypes[typeof Symbol.toPrimitive]) return false;
		if (!validTypes[typeof Symbol.toStringTag]) return false;

		return true;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// ES2015 Symbol polyfill for environments that do not support it (or partially support it)

	'use strict';

	var d              = __webpack_require__(4)
	  , validateSymbol = __webpack_require__(17)

	  , create = Object.create, defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
	  , isNativeSafe;

	if (typeof Symbol === 'function') {
		NativeSymbol = Symbol;
		try {
			String(NativeSymbol());
			isNativeSafe = true;
		} catch (ignore) {}
	}

	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name, ie11BugWorkaround;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			}));
			return name;
		};
	}());

	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return SymbolPolyfill(description);
	};

	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	module.exports = SymbolPolyfill = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		if (isNativeSafe) return NativeSymbol(description);
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),

		// If there's native implementation of given symbol, let's fallback to it
		// to ensure proper interoperability with other native functions e.g. Array.from
		hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
		isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
			SymbolPolyfill('isConcatSpreadable')),
		iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
		match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
		replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
		search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
		species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
		split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
		toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
		toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
		unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
	});

	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d('', function () { return this.__name__; })
	});

	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
		var symbol = validateSymbol(this);
		if (typeof symbol === 'symbol') return symbol;
		return symbol.toString();
	}));
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(5)
	  , normalizeOpts = __webpack_require__(12)
	  , isCallable    = __webpack_require__(13)
	  , contains      = __webpack_require__(14)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(6)()
		? Object.assign
		: __webpack_require__(7);


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(8)
	  , value = __webpack_require__(11)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(9)()
		? Object.keys
		: __webpack_require__(10);


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach, create = Object.create;

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(15)()
		? String.prototype.contains
		: __webpack_require__(16);


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(18);

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (x) {
		if (!x) return false;
		if (typeof x === 'symbol') return true;
		if (!x.constructor) return false;
		if (x.constructor.name !== 'Symbol') return false;
		return (x[x.constructor.toStringTag] === 'Symbol');
	};


/***/ }
/******/ ]);