

var simple = require('./tests/simple.js');
var chain = require('./tests/chain.js');
var wait_for = require('./tests/wait_for.js');


new Promise(function(resolve, reject) {
    console.log('Testing...');
    resolve();
        })
    .then(function() {
        return simple();
    })
    .then(function() {
        return chain();
    })
    .then(function() {
        return wait_for();
    })
    .then(function() {
        console.log('\nTesting finished.');
    })
    .catch(function(err) {
        console.error('Error:');
        console.error(err.stack);
    });
