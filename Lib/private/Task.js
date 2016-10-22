
var TaskCall = require('./TaskCall.js');


var Task = {

    _tasks: null,

    _name: '',
    _fn: null,

    _waitFors: null,
    _chainedTaskCalls: null,

    Class: function(tasks, task_name, fn)
    {
        this._tasks = tasks;

        this._name = task_name;
        this._fn = fn;

        this._waitFors = [];
        this._chainedTaskCalls = [];
    },

    apply: function(args)
    {
        this._tasks.apply(this, args);
    },

    call: function()
    {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        this.apply(args);
    },

    chainCall: function(task)
    {
        var args = [];
        for (var i = 1; i < arguments.length; i++)
            args.push(arguments[i]);

        this._chainedTaskCalls.push(new TaskCall.Class(task, args));

        return this;
    },

    waitFor: function(task_name)
    {
        this._waitFors.push(task_name);

        return this;
    }

};
Task.Class.prototype = Task;
module.exports = Task;
