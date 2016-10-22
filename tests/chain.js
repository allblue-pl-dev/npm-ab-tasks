
var abTasks = require('../index.js');


var tasks = abTasks.new();

var t1 = function(arg) {
    return tasks.create('chain.t1', function(args_array) {
        console.log('Task `t1` triggered with args:', args_array);
            })
        .chainCall(t2(), arg);
};

var t2 = function() {
    return tasks.create('chain.t2', function(args_array) {
        console.log('Task `t2` triggered with args:', args_array);
    });
};

var t3 = function() {
    return tasks.create('chain.t3', function(args_array) {
        console.log('Task `t3` triggered with args:', args_array);
        return false;
            })
        .chainCall(t2(), 'from t3');
}

module.exports = function() {
    return new Promise(function(resolve, reject) {
        console.log('\nCHAIN\n');
        console.log('Expected result:');
        console.log('t1 [ 0, 1, 2, 3 ], t2 [ 0, 1, 2, 3 ]');
        console.log('t1 [ 4, 5 ], t2 [ 4, 5 ]\n');

        t1(0).call(0);
        t1(1).call(1);

        setTimeout(function() {
            t1(2).call(2);
            t1(3).call(3);
        }, 90);

        setTimeout(function() {
            t1(4).call(4);
            t1(5).call(5);
        }, 300);

        setTimeout(function() {
            t3().call();
        }, 400);

        setTimeout(function() {
            resolve();
        }, 1000);
    });
};
