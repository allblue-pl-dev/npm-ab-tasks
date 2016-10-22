
var Task = require('./private/Task.js');
var TaskInfo = require('./private/TaskInfo.js');


var Tasks = {

    _WaitTime: 100,

    _waiting_TaskInfos: null,
    _taskInfos_Executing: null,

    _addWaitingTask: function(task, args, last_call)
    {
        if (!(task._name in this._waiting_TaskInfos))
            this._waiting_TaskInfos[task._name] = new TaskInfo.Class();

        var task_info = this._waiting_TaskInfos[task._name];
        task_info.addTask(task, args, last_call)

        return task_info;
    },

    _areWaitForsFinished: function(wait_fors)
    {
        for (var i = 0; i < wait_fors.length; i++) {
            var wait_for_regexp = new RegExp(this._waitForToRegExp(wait_fors[i]));

            for (var task_name in this._waiting_TaskInfos) {
                if (wait_for_regexp.test(task_name))
                    return false;
            }
        }

        return true;
    },

    _execTaskInfo: function(task_info)
    {
        // task_info.callsCount--;
        // if (task_info.callsCount > 0)
        //     return;

        delete this._waiting_TaskInfos[task_info.task._name];
        var result = task_info.task._fn.call(null, task_info.argsArray);

        if (result !== false) {
            for (var i = 0; i < task_info.chainedTaskCalls.length; i++) {
                var task_call = task_info.chainedTaskCalls[i];
                this._addWaitingTask(task_call.task, task_call.args, -1);
            }
        }

        this._processWaitingTasks();
    },

    _waitForToRegExp: function(str)
    {
        return '^' + str.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&")
                .replace('*', '.*') + '$';
    },

    _processWaitingTasks: function()
    {
        for (var task_name in this._waiting_TaskInfos) {
            var task_info = this._waiting_TaskInfos[task_name];

            if (!this._isTaskInfoReadyToExec(task_info))
                continue;

            this._execTaskInfo(task_info);
        }
    },

    _isTaskInfoReadyToExec: function(task_info)
    {
        if (task_info.lastCall !== -1) {
            if (Date.now() < task_info.lastCall + Tasks._WaitTime)
                return false;
        }

        if (!this._areWaitForsFinished(task_info.task._waitFors))
            return false;

        return true;
    },

    Class: function()
    {
        this._waiting_TaskInfos = {};
        this._taskInfos_Executing = {};
    },

    apply: function(task, args)
    {
        if (!Task.isPrototypeOf(task))
            throw new Error('`Task` must be a prototype of `task`.');

        this._addWaitingTask(task, args, Date.now());

        var self = this;
        setTimeout(function() {
            self._processWaitingTasks();
        }, Tasks._WaitTime);
    },

    call: function(task)
    {
        var args = [];
        for (var i = 1; i < arguments.length; i++)
            args.push(arguments[i]);

        return this.apply(task, args);
    },

    create: function(task_name, fn)
    {
        return new Task.Class(this, task_name, fn);
    }

};
Tasks.Class.prototype = Tasks;
module.exports = Tasks;
