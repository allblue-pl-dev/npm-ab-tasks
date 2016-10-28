
var abTasks = require('../index.js');


var tasks = abTasks.new();

var t = function() {
    return tasks.create('promise.t', function(args_array) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                console.log('Task `t` triggered with args:', args_array);
                resolve();
            }, 3000);
        });
    });
};

module.exports = function() {
    return new Promise(function(resolve, reject) {
        console.log('\nPROMISES\n');
        console.log('Expected result: [ 0, 1, 2, 3 ] -> 3000 break -> [ 4, 5 ]\n');

        t().call(0);
        t().call(1);

        setTimeout(function() {
            t().call(2);
            t().call(3);
        }, 90);

        setTimeout(function() {
            t().call(4);
            t().call(5);
        }, 500);

        setTimeout(function() {
            resolve();
        }, 7000);
    });
};
