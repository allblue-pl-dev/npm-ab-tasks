
var TaskInfo = {

    lastCall: -1, /* Timestamp of last call. */
    task: null, /* Last called task. */

    argsArray: [],

    chainedTasks: [],
    waitFors: [],

    Class: function()
    {
        this.argsArray = [];

        this.chainedTaskCalls = [];
        this.waitFors = [];
    },

    addTask: function(task, args, last_call)
    {
        last_call = typeof last_call === 'undefined' ? -1 : last_call;

        if (last_call !== -1)
            this.lastCall = last_call;

        this.task = task;
        this.argsArray.push(args);

        for (var i = 0; i < task._chainedTaskCalls.length; i++)
            this.chainedTaskCalls.push(task._chainedTaskCalls[i]);

        for (var i = 0; i < task._waitFors.length; i++) {
            if (this.waitFors.indexOf(task._waitFors[i]) === -1)
                this.waitFors.push(task._waitFors[i]);
        }
    }

};
TaskInfo.Class.prototype = TaskInfo;
module.exports = TaskInfo;
