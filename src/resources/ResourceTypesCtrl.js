appModule.controller('ResourceTypesCtrl', makeResourceTypesCtrl);

function makeResourceTypesCtrl(resourcesAPI, $timeout, $scope, envExtended, wwtFocusPanelSVC, userPermissionsAPI, recentlyViewed) {
    var vm = this;

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;
    $scope.envExtended = envExtended;

    init();

    function init() {
        userPermissionsAPI.canViewResources().then(function (response) {
            vm.canViewResources = response;

            if (!vm.canViewResources) {
                return;
            }

            var loadTimer = $timeout(function () {
                vm.isLongLoad = true;
            }, 700);

            resourcesAPI.getResourceTypes().then(function (response) {
                $timeout.cancel(loadTimer);
                vm.isLongLoad = false;
                vm.resourceTypes = response.data;

                recentlyViewed.get('resource-types', vm.resourceTypes).then(function (recentResponse) {
                    vm.recentResourceTypes = recentResponse.data
                })
            });
        });
    }

}