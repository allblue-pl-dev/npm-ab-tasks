
var abLog = require('ab-log');

var Task = require('./private/Task.js');
var TaskInfo = require('./private/TaskInfo.js');


var Tasks = {

    _WaitTime: 100,

    _taskInfos_Waiting: null,
    _taskInfos_Executing: null,

    _processCalls: 0,

    _addChainedTaskCalls: function(task_info)
    {
        for (var i = 0; i < task_info.chainedTaskCalls.length; i++) {
            var task_call = task_info.chainedTaskCalls[i];
            this._addWaitingTask(task_call.task, task_call.args, -1);
        }
    },

    _addWaitingTask: function(task, args, last_call)
    {
        if (!(task._name in this._taskInfos_Waiting))
            this._taskInfos_Waiting[task._name] = new TaskInfo.Class();

        var task_info = this._taskInfos_Waiting[task._name];
        task_info.addTask(task, args, last_call);

        return task_info;
    },

    _areWaitForsFinished: function(task_info)
    {
        var wait_fors = task_info.task._waitFors

        for (var i = 0; i < wait_fors.length; i++) {
            var wait_for_regexp = new RegExp(this._waitForToRegExp(wait_fors[i]));

            var task_name;

            for (task_name in this._taskInfos_Waiting) {
                if (task_name !== task_info.task._name)
                    if (wait_for_regexp.test(task_name))
                        return false;
            }

            for (task_name in this._taskInfos_Executing) {
                if (task_name !== task_info.task._name)
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

        /* Think about debug mode. */
        abLog.success('ABTasks.Exec', task_info.task._name);

        delete this._taskInfos_Waiting[task_info.task._name];
        this._taskInfos_Executing[task_info.task._name] = task_info;

        var result = task_info.task._fn.call(null, task_info.argsArray);

        if (Promise.resolve(result) === result) {
            var self = this;

            result
                .then(function() {
                    delete self._taskInfos_Executing[task_info.task._name];

                    self._addChainedTaskCalls(task_info);
                    // console.log('Process A', task_info.task._name);
                    self._processWaitingTasks();
                })
                .catch(function(err) {
                    delete self._taskInfos_Executing[task_info.task._name];

                    if (Object.prototype.toString.call(err) === '[object Error]')
                        err = err.stack;

                    abLog.error(err);

                    // console.log('Process B', task_info.task._name);
                    self._processWaitingTasks();
                });
        } else {
            delete this._taskInfos_Executing[task_info.task._name];

            if (result !== false)
                this._addChainedTaskCalls(task_info);

            // console.log('Process C', task_info.task._name);
            this._processWaitingTasks();
        }
    },

    _waitForToRegExp: function(str)
    {
        return '^' + str.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&")
                .replace('*', '.*') + '$';
    },

    _processWaitingTasks: function()
    {
        for (var task_name in this._taskInfos_Waiting) {
            var task_info = this._taskInfos_Waiting[task_name];

            if (!this._isTaskInfoReadyToExec(task_info))
                continue;

            this._execTaskInfo(task_info);
        }

        if (Object.keys(this._taskInfos_Waiting).length > 0 &&
                Object.keys(this._taskInfos_Executing).length === 0 &&
                this._processCalls === 0) {
            abLog.warn('Unexecuted tasks in waiting queue:',
                    Object.keys(this._taskInfos_Waiting));
        }
    },

    _isTaskInfoReadyToExec: function(task_info)
    {
        // console.log('isTaskInfoReadyToExec', task_info.task._name);

        if (task_info.lastCall !== -1) {
            if (Date.now() < task_info.lastCall + Tasks._WaitTime)
                return false;
        }

        if (task_info.task._name in this._taskInfos_Executing) {
            // console.log('B');
            return false;
        }

        if (!this._areWaitForsFinished(task_info)) {
            // console.log('C');
            return false;
        }

        // console.log('D');
        return true;
    },

    Class: function()
    {
        this._taskInfos_Waiting = {};
        this._taskInfos_Executing = {};
    },

    apply: function(task, args)
    {
        if (!Task.isPrototypeOf(task))
            throw new Error('`Task` must be a prototype of `task`.');

        this._addWaitingTask(task, args, Date.now());

        var self = this;
        this._processCalls++;
        setTimeout(function() {
            self._processCalls--;
            // console.log('Process', task._name);
            self._processWaitingTasks();
        }, Tasks._WaitTime + 1);
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
