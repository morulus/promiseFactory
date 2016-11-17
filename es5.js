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
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.default = promiseFactory;

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

	var idlePromise = function idlePromise() {
		_classCallCheck(this, idlePromise);
	};

	var createDestroyerFor = new Function('p', 'return "function"===typeof p.destroy ? function() { p.destroy(); } : new Function()');

	function createSubResolver(handler, resolve, reject, destroy) {
		var subRes = function subResolver(result) {
			try {
				var thenResult = handler(result);
				if ("object" === (typeof thenResult === 'undefined' ? 'undefined' : _typeof(thenResult)) && (thenResult instanceof Promise || thenResult instanceof idlePromise)) {
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
		subRes.reject = reject;
		subRes.destroy = destroy;
		return subRes;
	};

	function promiseFactory(_ref) {
		var _Object$create;

		var _ref$immediate = _ref.immediate,
		    immediate = _ref$immediate === undefined ? false : _ref$immediate,
		    _ref$perpetual = _ref.perpetual,
		    perpetual = _ref$perpetual === undefined ? false : _ref$perpetual,
		    _ref$autorun = _ref.autorun,
		    autorun = _ref$autorun === undefined ? true : _ref$autorun,
		    _ref$external = _ref.external,
		    external = _ref$external === undefined ? false : _ref$external,
		    _ref$chaining = _ref.chaining,
		    chaining = _ref$chaining === undefined ? true : _ref$chaining,
		    _ref$searchOutOfUse = _ref.searchOutOfUse,
		    searchOutOfUse = _ref$searchOutOfUse === undefined ? false : _ref$searchOutOfUse,
		    _ref$methodsNames = _ref.methodsNames,
		    methodsNames = _ref$methodsNames === undefined ? {} : _ref$methodsNames;


		var $_customizedMethodsNames = {};
		for (var prop in $defaultMethodsNames) {
			if ($defaultMethodsNames.hasOwnProperty(prop)) {
				$_customizedMethodsNames[prop] = methodsNames.hasOwnProperty(prop) ? methodsNames[prop] : $defaultMethodsNames[prop];
			}
		}

		var CustomizedPromise;

		var methods = Object.create(idlePromise.prototype, (_Object$create = {
			constructor: {
				value: function value(resolver) {
					this[$reinitialization](autorun, resolver);

					Object.defineProperty(this, '$_customizedMethodsNames', {
						writable: false,
						enumerable: false,
						configurable: false,
						value: $_customizedMethodsNames
					});
					if (searchOutOfUse) {
						var e = new Error();
						this[$outOfUse] = {
							callback: new Function('console.warn("Unused Promise found", "' + e.stack.replace(/[\n\r]/g, " ") + '")')
						};
						this[$activity]();
					}
					if (autorun) this[$execute]();
				}
			}
		}, _defineProperty(_Object$create, $activity, {
			value: function value() {
				clearTimeout(this[$outOfUse].timer);
				this[$outOfUse].timer = setTimeout(this[$outOfUse].callback, 10000);
			}
		}), _defineProperty(_Object$create, $reinitialization, {
			value: function value(autorun, resolver) {
				this[$promiseEnabled] = true;
				this[$promise] = {
					state: $statePending,
					resolver: resolver || null,
					fulfillReactions: [],
					rejectReactions: [],
					result: null, // Result value
					destroyHandlers: [],
					rejectionHandled: false
				};
			}
		}), _defineProperty(_Object$create, $execute, {
			value: function value(resolver) {

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
			}
		}), _defineProperty(_Object$create, $resolve, {
			value: function value(result) {
				var _this = this;

				if (!this[$promiseEnabled]) return null;
				if (searchOutOfUse) this[$activity]();
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

				if (!perpetual || !this[$promiseEnabled]) this[$promise].fulfillReactions = []; // Clear if not staying alive
				this[$doJob](jobs);
			}
		}), _defineProperty(_Object$create, $reject, {
			value: function value(e) {
				if (!this[$promiseEnabled]) return null;
				if (searchOutOfUse) this[$activity]();
				this[$promise].rejectionHandled = false;
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

				if (!perpetual || !this[$promiseEnabled]) this[$promise].rejectReactions = []; // Clear if not staying alive

				if (jobs.length > 0) {
					this[$doJob](jobs, true);
				} else {
					// Make sure that exception will be handling
					if (this[$promise].fulfillReactions.length === 0) {
						setTimeout(function () {
							if (!this[$promise].rejectionHandled) {
								console["function" === typeof console.error ? 'error' : 'log']("Unhandled Promise rejection", e);
							}
						}.bind(this));
					} else {
						// Reject all middleware Promises from then
						var _iteratorNormalCompletion3 = true;
						var _didIteratorError3 = false;
						var _iteratorError3 = undefined;

						try {
							for (var _iterator3 = this[$promise].fulfillReactions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
								var _reaction = _step3.value;

								_reaction.reject(e);
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
					}
				}
			}
		}), _defineProperty(_Object$create, $reset, {
			value: function value() {
				this[$promise].state = $statePending;
				this[$promise].result = null;
				return this;
			}
		}), _defineProperty(_Object$create, $doJob, {
			value: function value(jobs) {
				var rejection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				/*
	   Rejection can not be hidden from developer
	   */

				var jobList = function (result) {
					if (!this[$promiseEnabled]) return;
					for (var i = 0; i < jobs.length; ++i) {
						jobs[i].call(this, result);
						jobs.splice(i, 1);
						i--;
					}
				}.bind(this, this[$promise].result);
				if (immediate) jobList();else setTimeout(jobList, 0);
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.execute, {
			value: function value(resolver) {
				if (!(external || autorun)) {
					throw new Error("Method execute() is not aviable from outside");return null;
				}
				this[$execute](resolver);
				return this;
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.resolve, {
			value: function value(_value) {
				if (!external) {
					throw new Error("Method resolve() is not aviable from outside");return null;
				}
				this[$resolve](_value);
				return this;
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.reject, {
			value: function value(e) {
				if (!external) {
					throw new Error("Method reject() is not aviable from outside");return null;
				}
				this[$reject](e);
				return this;
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.reset, {
			value: function value() {
				if (!external) {
					throw new Error("Method reset() is not aviable from outside");return null;
				}
				this[$reset]();
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.destroy, {
			value: function value() {
				if (this.hasOwnProperty("destroyed")) return;
				this.destroyed = true;
				this[$_customizedMethodsNames.stop]();
				this[$reset]();
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = this[$promise].destroyHandlers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var handler = _step4.value;

						handler();
					}
					/* Destroys all child Promises */
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}

				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = this[$promise].fulfillReactions[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var _reaction2 = _step5.value;

						if ("function" === typeof _reaction2.destroy) _reaction2.destroy();
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}

				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = this[$promise].rejectReactions[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var _reaction3 = _step6.value;

						if ("function" === typeof _reaction3.destroy) _reaction3.destroy();
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
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
		}), _defineProperty(_Object$create, $_customizedMethodsNames.onDestroy, {
			value: function value(customHandler) {
				this[$promise].destroyHandlers.push(customHandler);
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.stop, {
			value: function value() {
				this[$promiseEnabled] = false;
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.then, {
			value: function value() {
				var _this2 = this;

				var onResolved = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
				var onRejected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				if (!onResolved) onResolved = function onResolved(r) {
					return r;
				};
				var promise = new CustomizedPromise(function (resolve, reject) {

					if ("function" === typeof onResolved) {
						var subResolver = createSubResolver(onResolved, resolve, reject, createDestroyerFor(_this2));
						if (_this2[$promise].state === $stateResolved) {
							_this2[$doJob]([subResolver]);
							if (perpetual) _this2[$promise].fulfillReactions.push(subResolver);
						} else {
							_this2[$promise].fulfillReactions.push(subResolver);
						}
					}

					if ("function" === typeof onRejected) {
						var subRejecter = createSubResolver(onRejected, resolve, reject, createDestroyerFor(_this2));
						if (_this2[$promise].state === $stateRejected) {
							/*
	      If rejection has not handled by existing rejectReactions
	      then it must inform to Promise that it did it now.
	      */
							_this2[$promise].rejectionHandled = true;
							_this2[$doJob]([subRejecter]);
							if (perpetual) _this2[$promise].rejectReactions.push(subRejecter);
						} else {
							_this2[$promise].rejectReactions.push(subRejecter);
						}
					}
				});

				if (!autorun) {
					promise[$execute]();
				}

				if (chaining) return promise;else return this;
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.catch, {
			value: function value(onRejected) {
				return this[$_customizedMethodsNames.then](false, onRejected);
			}
		}), _defineProperty(_Object$create, $_customizedMethodsNames.always, {
			value: function value(onAlways) {
				return this[$_customizedMethodsNames.then](onAlways, onAlways);
			}
		}), _defineProperty(_Object$create, 'transform', {
			value: function value(newConfiguration) {
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
			}
		}), _Object$create));

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

		var directResolve = function directResolve(value) {
			return new CustomizedPromise(function (resolve) {
				resolve(value);
			});
		};

		var directReject = function directReject(e) {
			return new CustomizedPromise(function (resolve, reject) {
				reject(e);
			});
		};

		var SupremeSubject = function () {
			function SupremeSubject() {
				_classCallCheck(this, SupremeSubject);

				this.backtracks = [];
				this.actual = true;
			}

			_createClass(SupremeSubject, [{
				key: 'backtrack',
				value: function backtrack(destroyer) {
					if ("function" === typeof destroyer) this.backtracks.push(destroyer);
				}
			}, {
				key: 'async',
				value: function async(handler, late) {
					var supreme = this;
					return function () {
						if (supreme.actual) return handler.apply(undefined, arguments);else return "function" === typeof late ? late.apply(undefined, arguments) : null;
					};
				}
			}, {
				key: 'destroy',
				value: function destroy() {
					this.actual = false;
					this.backtracks.forEach(function (destroyer) {
						destroyer();
					});
					this.promise.destroy();
				}
			}]);

			return SupremeSubject;
		}();

		var methodSupreme = function methodSupreme(resolver) {
			var supremeSubject = null;
			var decoratedResolver = function decoratedResolver() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				if (null !== supremeSubject) {
					supremeSubject.destroy();
				}
				supremeSubject = new SupremeSubject();
				supremeSubject.promise = new CustomizedPromise(function (resolve, reject) {

					var returnedDestroyer = resolver.apply(this, [resolve, reject, supremeSubject.backtrack.bind(supremeSubject), supremeSubject.async.bind(supremeSubject)].concat(args));
					if ("function" === typeof returnedDestroyer) supremeSubject.backtrack(returnedDestroyer);
				});

				if (!autorun) supremeSubject.promise[$execute]();

				return supremeSubject.promise;
			};

			return decoratedResolver;
		};

		if (false) {
			CustomizedPromise = function CustomizedPromise() {
				return methods.constructor.apply(this, Array.from(arguments));
			};

			CustomizedPromise.prototype = Object.create(methods);

			CustomizedPromise.all = methodAll;
			CustomizedPromise.supreme = methodSupreme;
			CustomizedPromise.resolve = directResolve;
			CustomizedPromise.reject = directReject;
		} else {
			CustomizedPromise = function (_idlePromise) {
				_inherits(CustomizedPromise, _idlePromise);

				_createClass(CustomizedPromise, null, [{
					key: 'all',
					value: function all(promises) {
						return methodAll.apply(this, Array.from(arguments));
					}
				}, {
					key: 'resolve',
					value: function resolve(value) {
						return directResolve.apply(this, Array.from(arguments));
					}
				}, {
					key: 'reject',
					value: function reject(e) {
						return directReject.apply(this, Array.from(arguments));
					}
				}, {
					key: 'supreme',
					value: function supreme() {
						return methodSupreme.apply(this, Array.from(arguments));
					}
				}]);

				function CustomizedPromise(resolver) {
					var _ret3;

					_classCallCheck(this, CustomizedPromise);

					var _this3 = _possibleConstructorReturn(this, (CustomizedPromise.__proto__ || Object.getPrototypeOf(CustomizedPromise)).call(this));

					return _ret3 = methods.constructor.apply(_this3, Array.from(arguments)), _possibleConstructorReturn(_this3, _ret3);
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
				}, {
					key: $reset,
					value: function value() {
						return methods[$reset].apply(this, Array.from(arguments));
					}

					/*
	    After resolving (or rejecting) all reactions will be called in the next tick
	    */

				}, {
					key: $doJob,
					value: function value(jobs) {
						var rejection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

						return methods[$doJob].apply(this, Array.from(arguments));
					}
				}, {
					key: $activity,
					value: function value() {
						return methods[$activity].apply(this, Array.from(arguments));
					}
				}, {
					key: $_customizedMethodsNames.execute,
					value: function value(resolver) {
						return methods[$_customizedMethodsNames.execute].apply(this, Array.from(arguments));
					}
				}, {
					key: $_customizedMethodsNames.resolve,
					value: function value(_value2) {
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
						var onResolved = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
						var onRejected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

						return methods[$_customizedMethodsNames.then].apply(this, Array.from(arguments));
					}
				}, {
					key: $_customizedMethodsNames.always,
					value: function value() {
						return methods[$_customizedMethodsNames.always].apply(this, Array.from(arguments));
					}
				}, {
					key: $_customizedMethodsNames.catch,
					value: function value(onRejected) {
						return methods[$_customizedMethodsNames.catch].apply(this, Array.from(arguments));
					}
				}, {
					key: 'transform',
					value: function transform(newConfiguration) {
						return methods.transform(false, onRejected);
					}
				}]);

				return CustomizedPromise;
			}(idlePromise);
		}

		return CustomizedPromise;
	}
	module.exports = exports['default'];

/***/ }
/******/ ]);