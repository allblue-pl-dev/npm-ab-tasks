
var abTasks = require('../index.js');


var tasks = abTasks.new();

var t = function() {
    return tasks.create('simple.t', function(args_array) {
        console.log('Task `t` triggered with args:', args_array);
    });
};

module.exports = function() {
    return new Promise(function(resolve, reject) {
        console.log('\nSIMPLE\n');
        console.log('Expected result: [ 0, 1, 2, 3 ], [ 4, 5 ]\n');

        t().call(0);
        t().call(1);

        setTimeout(function() {
            t().call(2);
            t().call(3);
        }, 90);

        setTimeout(function() {
            t().call(4);
            t().call(5);
        }, 300);

        setTimeout(function() {
            resolve();
        }, 500);
    });
};
