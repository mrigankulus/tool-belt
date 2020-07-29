appModule.controller('ComponentsCtrl', makeComponentsCtrl);

function makeComponentsCtrl($scope, componentsAPI, userPermissionsAPI, $timeout, envExtended, recentlyViewed, technologiesApi) {
    var vm = this;

    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.openAddComponentForm = openAddComponentForm;
    vm.closeAddComponentForm = closeAddComponentForm;
    vm.componentsLimit = 24;

    $scope.envExtended = envExtended;

    init();

    function init() {

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        componentsAPI.getComponents().then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.components = response.data;

            recentlyViewed.get('components', vm.components).then(function (recentResponse) {
                vm.recentComponents = recentResponse.data
            })
        });

        userPermissionsAPI.canEditComponents().then(function (response) {
            vm.canEditComponents = response;
        });

        technologiesApi.get().then(function (response) {
            vm.technologies = response.data
        })

        vm.watcherSettings = {
            resourceTypeId: 'dev-asset-type',
            resourceId: 'component',
            watchText: 'Watch for New Components',
            unWatchText: 'Stop Watching for New Components',
            position: 'alignRight'
        };
    }

    function shouldShowShowMore() {
        return vm.components && !vm.componentSearchText && (vm.components.length > vm.componentsLimit);
    }

    function showMore() {
        vm.componentsLimit += vm.components.length;
    }

    function openAddComponentForm() {
        vm.isAddComponentForm = true;
    }

    function closeAddComponentForm() {
        vm.isAddComponentForm = false;
    }
}