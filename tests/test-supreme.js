'use strict';
var tap = require('tap');
var promiseFactory = require('./../es5.js');

tap.test('Classc chaining', function(t) {
    t.plan(4);
    var ClasicPromise = promiseFactory({
    });

    var supremeMethod = ClasicPromise.supreme(function(resolve, reject, backtrack, async) {
    	console.log('Constructed')
    	t.ok(true);

        setTimeout(async(function() {
            console.log('Async');
            t.ok(true);
        }, function() {
            console.log('Too late');
        }), 20);

    	backtrack(function() {
    		console.log('Destructed');
    		t.ok(true);
    	});
    });


    supremeMethod();
    supremeMethod();
});