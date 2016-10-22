
var abTasks = require('../index.js');


var tasks = abTasks.new();

var t1 = function() {
    return tasks.create('chain.t1', function(args_array) {
        console.log('Task `t1` triggered with args:', args_array);
    });
};

var t2 = function() {
    return tasks.create('chain.t2', function(args_array) {
        console.log('Task `t2` triggered with args:', args_array);
            })
        .waitFor('chain.t1');

};

module.exports = function() {
    return new Promise(function(resolve, reject) {
        console.log('\nWAIT FOR\n');
        console.log('Expected result:');
        console.log('t1 [ 0, 1, 2, 3 ]');
        console.log('t2 [ 4, 5 ]\n');

        [ 0, 1, 2, 3 ].forEach(function(i) {
            setTimeout(function() {
                t1().call(i);
            }, i * 90);
        });

        t2().call(4);
        t2().call(5);

        setTimeout(function() {
            resolve();
        }, 1500);
    });
};
