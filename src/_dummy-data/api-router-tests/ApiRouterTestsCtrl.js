appModule.controller('ApiRouterTestsCtrl', makeApiRouterTestsCtrl)

function makeApiRouterTestsCtrl($http, wwtEnv) {
    var vm = this

    $http.get(wwtEnv.getApiForwardUrl() + '/report-services/catalog-admin/reports?xx-route-type=location').then(function (response) {
        vm.result = response
    })
}