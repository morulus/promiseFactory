'use strict';
var tap = require('tap');
var promiseFactory = require('./../es5.js');
var expectResults = [1,2,3,4,5];
var expect = expectResults[Symbol.iterator]();
tap.test('Click counter', function(t) {
    t.plan(5);
    global.StreamedPromise = promiseFactory({
        perpetual: true,
        autorun: false,
        external: true
    });
    
    // Click counter example
    var clicks = 0;
    var clickCounter = new StreamedPromise();
    clickCounter
    .then(function() {
        ++clicks;
        t.ok(expect.next().value==clicks);
    });

    var clickHandler = clickCounter.resolve.bind(clickCounter);
    clickHandler();
    clickHandler();
    clickHandler();
    clickHandler();
    clickHandler();
});
