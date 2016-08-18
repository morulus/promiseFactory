'use strict';
var tap = require('tap');
var promiseFactory = require('./../es5.js');

tap.test('Classc chaining', function(t) {
    t.plan(4);
    var ClasicPromise = promiseFactory({
    });

    var tester = new ClasicPromise(function(resolve, reject) {
        resolve(1);
    })
        .then(function(result) {
            t.ok(result===1, 'First result must equals 1');
            return 2;
        });


    tester.then(function(result) {
            t.ok(result===2, 'Second result must equals 2');
            throw new Error('Oups');
        })
        .then(function(result) {
            return new ClasicPromise(function(resolve, reject) {
                resolve(4);
            });
        })
        .catch(function(e) {
            t.ok(e.message=='Oups');
            return 123;
        })
        .then(function(newContent) {
            t.ok(newContent==123);
        });
});