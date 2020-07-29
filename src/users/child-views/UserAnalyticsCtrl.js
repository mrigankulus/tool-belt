appModule.controller('UserAnalyticsCtrl', makeUserAnalyticsCtrl)

function makeUserAnalyticsCtrl($scope) {
    var vm = this

    vm.getDetailParams = getDetailParams
    vm.getForUserDetailParams = getForUserDetailParams

    $scope.$watch('UserDetail.user', init);

    function init() {
        if (!_.get($scope.UserDetail, 'user.id')) {
            return
        }

        vm.reportId = `actor.${$scope.UserDetail.user.userName}`
        vm.forUserReportId = `user-events-by-user`
        vm.forUserSelect = `category,data.${$scope.UserDetail.user.id}`
    }

    function getDetailParams(args) {
        return {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            resourceTypeId: _.get(args, 'seriesName'),
            actorUserId: $scope.UserDetail.user.id
        }
    }

    function getForUserDetailParams(args) {
        return {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            eventTypeId: _.get(args, 'seriesName'),
            resourceTypeId: 'user',
            resourceId: $scope.UserDetail.user.id
        }
    }
}