appModule.controller('TaskTypeCtrl', makeTaskTypeCtrl)

function makeTaskTypeCtrl(TaskType, $state, $scope, envExtended, taskTypeRoutes) {
    var vm = this

    $scope.envExtended = envExtended

    vm.tabs = taskTypeRoutes()

    init()

    function init() {
        TaskType.findById($state.params.id).then(function (response) {
            vm.taskType = response.data
        })
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'taskType') {
            $state.go('.notifications')
        }
    });
}