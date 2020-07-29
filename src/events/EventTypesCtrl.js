appModule.controller('EventTypesCtrl', makeEventTypesCtrl);

function makeEventTypesCtrl(resourcesAPI, $scope, $timeout, $state, wwtFocusPanelSVC, envExtended, notificationsAPI, userPermissionsAPI, recentlyViewed) {
    var vm = this;

    vm.isViewingHowTo = isViewingHowTo;

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;
    $scope.envExtended = envExtended;

    init();

    function init() {
        userPermissionsAPI.canViewEvents().then(function (response) {
            vm.canViewEvents = response;

            if (!vm.canViewEvents) {
                return;
            }

            var loadTimer = $timeout(function () {
                vm.isLongLoad = true;
            }, 700);


            notificationsAPI.getDefaultEventTypes().then(function (defaultTypesResponse) {
                vm.defaultEventTypes = defaultTypesResponse.data;


                resourcesAPI.getEventTypes().then(function (response) {
                    $timeout.cancel(loadTimer);
                    vm.isLongLoad = false;
                    vm.eventTypes = response.data;
                    vm.eventTypes.forEach(mapDefaultTitle);

                    recentlyViewed.get('event-types', vm.eventTypes).then(function (recentResponse) {
                        vm.recentEventTypes = recentResponse.data
                    })
                });
            });
        });
    }

    function mapDefaultTitle(eventType) {
        // get a more descriptive title for default event types so they don't all look the same
        // in the list
        if (eventType.id.indexOf('default-type-') > -1 && eventType.resourceType) {
            eventType.title = eventType.resourceType.title + ': ' + eventType.title;
        }

        return eventType;
    }

    function isViewingHowTo() {
        return $state.includes('eventTypes.howTo');
    }
}