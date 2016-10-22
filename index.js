
var Tasks = require('./Lib/Tasks.js');


exports.Lib = require('./Lib.js');

exports.new = function() {
    return new Tasks.Class();
};
