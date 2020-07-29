appModule.controller('TaskTypeTasksCtrl', makeTaskTypeTasksCtrl)

function makeTaskTypeTasksCtrl($state, $scope) {
    var vm = this

    init()

    function init() {
        if (!_.get($scope.TaskType, 'taskType')) return

        vm.loading = true
        $scope.TaskType.taskType.listTasks().then(function (tasksResponse) {
            vm.tasks = tasksResponse.data
            vm.loading = false
        })
    }
}