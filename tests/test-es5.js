'use strict';
var tap = require('tap');
var promiseFactory = require('./../es5.js');

tap.test('Validate variables', function(t) {
	t.ok("function"===typeof promiseFactory, "promiseFactory must be a function");
	t.end();
});

tap.test('Classic resolve', function(t) {
	t.plan(1);
	var ClasicPromise = promiseFactory({
	});

	var tester = new ClasicPromise(function(resolve, reject) {
		resolve(123)
	});

	tester.then(function(result) {
		t.ok(result==123, "Result must be 123");
	});
	
});

tap.test('Classic reject', function(t) {
	t.plan(1);
	var ClasicPromise = promiseFactory({
	});

	var tester = new ClasicPromise(function(resolve, reject) {
		reject(new Error("123"))
	});

	tester.then(function(e) {
		t.balout("Reject in wrong hadnler");
	});

	tester.catch(function(e) {
		t.ok(e.message=="123", "Error message must be 123");
	});
});

tap.test('Classic reject by throw', function(t) {
	t.plan(1);
	var ClasicPromise = promiseFactory({
	});

	var tester = new ClasicPromise(function(resolve, reject) {
		throw new Error("damn");
		resolve(new Error("123"))
	});

	tester.then(function(e) {
		t.balout("Reject in wrong hadnler");
	});

	tester.catch(function(e) {
		t.ok(e.message=="damn", "Error message must be 'damn'");
	});
});

tap.test('Classic reject by throw', function(t) {
	t.plan(1);
	var ClasicPromise = promiseFactory({
	});

	var tester = new ClasicPromise(function(resolve, reject) {
		throw new Error("damn");
		resolve(new Error("123"))
	});

	tester.then(function(e) {
		t.balout("Reject in wrong hadnler");
	});

	tester.catch(function(e) {
		t.ok(e.message=="damn", "Error message must be 'damn'");
	});
});

tap.test('Classc chaining', function(t) {
	t.plan(6);
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

tap.test('Stay alive Promise', function(t) {
	t.plan(2);
	var ClasicPromise = promiseFactory({
		perpetual: true
	});

	var tester = new ClasicPromise(function(resolve, reject) {
		
		resolve(1);
		setTimeout(function() { 
			resolve(2); 
		}, 200);
	});

	var i = 1;
	tester.then(function(result) {
		t.ok(result==i, "Result must be "+i); i++;
	});
});

tap.test('Promise.all', function(t) {
	t.plan(1);
	var ClasicPromise = promiseFactory({
	});

	var all = [];
	all.push(new ClasicPromise(function(resolve, reject) {
		resolve(1);
	}));

	all.push(new ClasicPromise(function(resolve, reject) {
		resolve(2);
	}));

	all.push(new ClasicPromise(function(resolve, reject) {
		resolve(3);
	}));
	
	ClasicPromise.all(all).then(function(result) {

		t.ok(result[0]==1&&result[1]==2&&result[2]==3, "Result must be [1,2,3]");
	});
});

tap.test('Promise.all', function(t) {
    t.plan(2);
    var ClasicPromise = promiseFactory({
        perpetual: true
    });

    var all = [];
    all.push(new ClasicPromise(function(resolve, reject) {
        resolve(1);
    }));

    all.push(new ClasicPromise(function(resolve, reject) {
        resolve(2);
    }));

    all.push(new ClasicPromise(function(resolve, reject) {
        resolve(3);

        setTimeout(function() {
            resolve(4);
        }, 200);
    }));
    var i = 0;
    ClasicPromise.all(all).then(function(result) {
        console.log('result', result);
        if (i===0)
        t.ok(result[0]==1&&result[1]==2&&result[2]==3, "Result must be [1,2,3]");
        else if (i===1) {
            t.ok(result[0]==1&&result[1]==2&&result[2]==4, "Result must be [1,2,4]");
        }
        i++;
    });
});
