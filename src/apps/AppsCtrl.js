appModule.controller('AppsCtrl', makeAppsCtrl);

function makeAppsCtrl($scope, appsAPI, userPermissionsAPI, $timeout, wwtFocusPanelSVC, envExtended, recentlyViewed) {
    var vm = this;

    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.appsLimit = 24;
    vm.init = init;

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;
    $scope.envExtended = envExtended;

    init();

    function init() {

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        appsAPI.getApps(vm.includeApiMasks).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.apps = response.data;

            recentlyViewed.get('applications', vm.apps).then(function (recentResponse) {
                vm.recentApps = recentResponse.data
            })
        });

        userPermissionsAPI.canEditApps().then(function (response) {
            vm.canEditApps = response;
        });

        vm.watcherSettings = {
            resourceTypeId: 'dev-asset-type',
            resourceId: 'application',
            watchText: 'Watch for New Apps',
            unWatchText: 'Stop Watching for New Apps',
            position: 'alignRight'
        };
    }

    function shouldShowShowMore() {
        return vm.apps && !vm.appSearchText && (vm.apps.length > vm.appsLimit);
    }

    function showMore() {
        vm.appsLimit += vm.apps.length;
    }
}