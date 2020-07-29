appModule.component('taskTypeCard', {
    templateUrl: 'task-types/task-type-card/taskTypeCard.html',
    controller: taskTypeCardCtrl,
    bindings: {
        taskType: '<'
    }
});

function taskTypeCardCtrl() {
    var vm = this
}