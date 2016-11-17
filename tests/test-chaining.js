'use strict';
var tap = require('tap');
var promiseFactory = require('./../es5.js');

var ClasicPromise = promiseFactory({
    });
tap.test('Classc chaining', function(t) {
    t.plan(1);


    var tester = new ClasicPromise(function(resolve, reject) {
        resolve(1);
    })
        .then(function(result) {
            t.ok(result===1, 'First result must equals 1');
            return 2;
        });
});

tap.test('Return promise', function(t) {
    t.plan(5);
    ClasicPromise.resolve(2).then(function(result) {
            t.ok(result===2, 'Second result must equals 2');
            var p = new Promise(function(resolve, reject) {
                resolve(3);
            });
            return p;
        })
        .then(function(result) {
            t.ok(result===3, 'Third result must equals 3');
            return new ClasicPromise(function(resolve, reject) {
                resolve(4);
            });
        })
        .then(function(result) {
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
        })
});


tap.test('Subscribe to catch', function(t) {
  t.plan(1);
  ClasicPromise.resolve(2).then(function(r) {
    return r+1;
  })
  .catch(function(e) {
    throw e;
  })
  .then(function(r) {
    t.ok(r==3, 'r must be 3');
  });
});

tap.test('Catch', function(t) {
  t.plan(1);
  ClasicPromise.resolve(2).then(function(r) {
    throw new Error('bailout');
  })
  .catch(function(e) {
    t.ok(e instanceof Error, 'e must be an Error');
    return 777;
  })
  .then(function(r) {
    t.ok(r===777, 'catch must returns a value 777');
  });
});
