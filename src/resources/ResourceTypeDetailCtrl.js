appModule.controller('ResourceTypeDetailCtrl', makeResourceTypeDetailCtrl);

function makeResourceTypeDetailCtrl($scope, resourcesAPI, $state, $stateParams, resourcesRoutes, dtTitleSVC, hotkeys, envExtended, userPermissionsAPI, recentlyViewed) {
    var vm = this;

    vm.tabs = resourcesRoutes();
    vm.getFriendlyTitle = getFriendlyTitle;
    vm.shouldShowMultplePathWarning = shouldShowMultplePathWarning;
    vm.hasErrors = hasErrors;
    vm.restore = restore;

    $scope.envExtended = envExtended;

    init();

    $scope.$on('resourceEventStreamLoaded-resource-type', function () {
        $scope.$broadcast('force-wwt-scroll-trap-refresh', {instanceName: 'historyPanelScrollTrap'});
    });

    function init() {
        userPermissionsAPI.canViewResources().then(function (response) {
            vm.canViewResources = response;

            resourcesAPI.getResourceType($stateParams.id).then(function (response) {
                vm.resourceType = response.data;

                setPageTitle();

                vm.watcherSettings = {
                    resourceTypeId: 'resource-type',
                    resourceId: vm.resourceType.id
                };

                vm.resourceEventStreamSettings = {
                    resourceTypeId: 'resource-type',
                    resourceId: vm.resourceType.id
                };

                recentlyViewed.save('resource-types', vm.resourceType)

            }).catch(function (err) {
                if (err.status === 404) {
                    $state.go('404');
                }
            });
        });
    }

    function setPageTitle() {
        dtTitleSVC.set($state.current.data.browserTitle + ' | ' + vm.resourceType.title + ' | Dev Tool Belt');
    }

    function getFriendlyTitle(tabTitle) {
        return _.startCase(tabTitle);
    }

    function goToSettingsTab() {
        if ($state.is('resourceTypeDetail.settings')) {
            return false;
        }

        $state.go('resourceTypeDetail.settings');
    }


    function shouldShowMultplePathWarning() {
        var resourceType = vm.resourceType;

        if (!resourceType) {
            return;
        }

        if (!resourceType.eventTypes || !resourceType.eventTypes.length) {
            return;
        }

        var pathsToResourceTypeIds = _.chain(resourceType.eventTypes)
                .map('pathToResourceId')
                .uniq()
                .value();

        return pathsToResourceTypeIds && pathsToResourceTypeIds.length && pathsToResourceTypeIds.length > 1;
    }

    function hasErrors() {
        return shouldShowMultplePathWarning() || (vm.resourceType && vm.resourceType.deleted);
    }

    function restore() {
        vm.isRestoring = true;

        resourcesAPI.restoreResourceType(vm.resourceType.id).then(function (response) {
            vm.resourceType = response.data;
            vm.isRestoring = false;
        });
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'resourceTypeDetail') {
            $state.go('.event-types');
        }
    });

    hotkeys.bindTo($scope)
        .add({
            combo: 'shift+s',
            description: 'Go to Settings Tab',
            callback: function (event, hotkey) {
                event.preventDefault();
                goToSettingsTab();
            }
        });
}
