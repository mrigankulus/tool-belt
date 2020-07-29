appModule.controller('TaskTypeAnalyticsCtrl', makeTaskTypeAnalyticsCtrl)

function makeTaskTypeAnalyticsCtrl($scope) {
    var vm = this

    vm.getAnalyticsDetailParams = getAnalyticsDetailParams

    init()

    function init() {
        if (!_.get($scope.TaskType, 'taskType')) return
        vm.taskType = $scope.TaskType.taskType
        vm.reportId = `task-type-activity.${$scope.TaskType.taskType.id}`
    }

    function getAnalyticsDetailParams(args) {
        return {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            eventTypeId: _.get(args, 'seriesName'),
            resourceTypeId: 'task',
            metaData: 'taskType.titleSingular:' + vm.taskType.titleSingular
        }
    }
}