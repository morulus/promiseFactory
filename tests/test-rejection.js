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
           // t.ok(result===3, 'Third result must equals 3');
            return new ClasicPromise(function(resolve, reject) {
                resolve(4);
            });
        })
        .catch(function(e) {
            console.log('Git rejection', e);
            return 123;
        })
        .then(function(content) {
            console.log('Haha', content);
            t.ok();
        });

        setTimeout(function() {
            t.ok(2);
        });

        /*.then(function(result) {
            t.ok(result===4, 'Fourth result must equals 4');
            throw new Error('done');
        })
        .catch(function(e) {
            t.ok(e.message=='done', 'Reject message must be \'done\'');
            return new Promise(function(resolve, reject) {
                reject(new Error("done2"));
            });
        })
        .catch(function(e) {
            t.ok(e.message=='done2', 'Reject message must be \'done2\'');
        })*/
});