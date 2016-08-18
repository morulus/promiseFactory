promiseFactory
--
An function promiseFactory can create custom Promise with your own configuration

# Getting started

## Install
ES6
```
import promiseFactory from 'promiseFactory';
```
ES5 compatible (excludes es6 features)
```js
var promiseFactory = require('promiseFactory/es5');
```

## Usage
```js
var MyPromise = promiseFactory({
  immediate: false, 
	perpetual: false, 
	autorun: true, 
	external: false, 
	chaining: true,
});
```

### Params
- immediate (default: FALSE) If TRUE `then`|`catch` handler executes right after calling `resolve`, if FALSE `then`|`catch` handler invokes at next tick
- perpetual (default: FALSE) If TRUE The Promise will never be completed. You can call `resolve` again and again.
- autorun (default: TRUE) If FALSE function `resolver` will not executed automaticly, you have to call `execute` method manually.
- external: (default: FALSE) If TRUE allows to call methods `resolve` and `reject` from outside of Promise.
- chaining: (default: TRUE) If FALSE disables promise chaining, so `then` always returns origin Promise ref.

# License
MIT

# Author 
Vladimir Kalmykov <vladimirmorulus@gmail.com>
