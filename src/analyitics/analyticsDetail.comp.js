appModule.component('analyticsDetail', {
    templateUrl: 'analyitics/analyticsDetail.html',
    controller: AnalyticsDetailCtrl,
    bindings: {
        analyticsDetailParams: '=',
        showTable: '<'
    }
});

function AnalyticsDetailCtrl($http, wwtEnv, $state, $filter, wwtFocusPanelSVC, $timeout, envExtended, $scope) {
    var vm = this

    $scope.envExtended = envExtended

    init()

    function init() {
        vm.isReady = false

        // timeout is to smooth panel animation a bit
        $timeout(function () {
            getAnalytics().then(function (response) {
                vm.events = response.data
                vm.isReady = true
            })
        }, 100)
    }

    function getAnalytics() {
        return $http.get(wwtEnv.getApiRouterUrl() + '/user-events', {
            params: vm.analyticsDetailParams
        })
    }
}