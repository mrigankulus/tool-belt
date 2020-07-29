appModule.controller('ResourceTypeEventTypesCtrl', makeResourceTypeEventTypesCtrl);

function makeResourceTypeEventTypesCtrl($rootScope, $scope, resourcesAPI, $stateParams, $state, $timeout, wwtFocusPanelSVC, notificationsAPI) {
    var vm = this;

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;
    vm.useDefaultEventType = useDefaultEventType;

    init();

    $scope.$on('event-type-created', function(event, eventType) {
        vm.eventTypes.push(eventType);
        $scope.shouldShowEventTypesBlankSlate = false;
        wwtFocusPanelSVC.closePanel('newEventTypeForm')
    });

    function init() {
        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        resourcesAPI.getEventTypeByResourceType($stateParams.id).then(function (response) {
            vm.eventTypes = _.filter(response.data, function (type) {
                return !type.id.includes('default-type-');
            });

            vm.defaultEventTypes = _.filter(response.data, function (type) {
                return type.id.includes('default-type-');
            });

            checkDefaultEventTypes().then(function () {

                $timeout.cancel(loadTimer);
                vm.isLongLoad = false;

                if (!vm.eventTypes.length) {
                    $scope.shouldShowEventTypesBlankSlate = true;
                } else {
                    $scope.shouldShowEventTypesBlankSlate = false;
                }

            });

        });
    }

    function checkDefaultEventTypes() {
        return notificationsAPI.getDefaultEventTypesForResourceType($stateParams.id).then(function (response) {
            var unUsedDefaultTypes = [];

            _.forIn(response.data, function (value, key) {
                if (!_.find(vm.defaultEventTypes, {id: value.targetId})) {
                    value.isUnusedDefault = true;
                    vm.defaultEventTypes.push(value);
                }
            });
        });
    }

    function useDefaultEventType(defaultType) {
        defaultType.isCreating = true;

        resourcesAPI.createDefaultEventForResourceType($stateParams.id, defaultType).then(function (response) {
            $rootScope.$broadcast('event-type-created', response.data);
            $state.go('eventTypeDetail', {id: response.data.id});
            defaultType.isCreating = false;
        });
    }
}