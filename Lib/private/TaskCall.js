

var TaskCall = {

    task: null,
    args: null,

    Class: function(task, args)
    {
        this.task = task;
        this.args = args;
    }

};
TaskCall.Class.prototype = TaskCall;
module.exports = TaskCall;
