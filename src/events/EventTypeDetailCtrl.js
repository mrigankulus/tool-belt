appModule.controller('EventTypeDetailCtrl', makeEventTypeDetailCtrl);

function makeEventTypeDetailCtrl($scope, $state, $timeout, $stateParams, eventsRoutes, resourcesAPI, notificationsAPI, amqpExchangeUtil, hotkeys, googleAnalytics, envExtended, userPermissionsAPI, recentlyViewed, appsAPI, wwtFocusPanelSVC) {
    var vm = this;

    vm.tabs = eventsRoutes();
    vm.resumeNotifications = resumeNotifications;
    vm.hasErrors = hasErrors;
    vm.restore = restore;
    vm.isDefaultEventType = isDefaultEventType;
    vm.getDefaultExchange = getDefaultExchange;
    vm.getDefaultExchangeForComment = getDefaultExchangeForComment;
    vm.getProfileNameForId = getProfileNameForId;
    vm.update = update

    $scope.envExtended = envExtended;
    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;

    userPermissionsAPI.canViewEvents().then(function (response) {
        vm.canViewEvents = response;

        if (!vm.canViewEvents) {
            return;
        }

        init();
    });

    $scope.$on('resource-type-created', function(event, resourceType) {
        vm.resourceTypesOptions.push(resourceType);
        vm.eventType.resourceType = resourceType;

        wwtFocusPanelSVC.closePanel('newResourceTypeForm');
    });

    $scope.$on('resourceEventStreamLoaded-event-type', function () {
        $scope.$broadcast('force-wwt-scroll-trap-refresh', {instanceName: 'historyPanelScrollTrap'});
    });

    function init() {
        resourcesAPI.getEventTypeById($stateParams.id).then(function (response) {
            vm.eventType = response.data;

            vm.watcherSettings = {
                resourceTypeId: 'event-type',
                resourceId: vm.eventType.id
            };

            vm.resourceEventStreamSettings = {
                resourceTypeId: 'event-type',
                resourceId: vm.eventType.id
            };

            recentlyViewed.save('event-types', vm.eventType)

        }).catch(function (err) {
            if (err.status === 404) {
                $state.go('404');
            }
        });

        resourcesAPI.getResourceTypes().then(function (response) {
            vm.resourceTypesOptions = response.data;
        });

        notificationsAPI.getExchanges().then(function (response) {
            var exchanges = amqpExchangeUtil.formatExchangesForSelect(response.data);

            amqpExchangeUtil.setExchangesInUsedBy(exchanges).then(function (processedExchanges) {
                vm.amqpExchangeOptions = processedExchanges;
            });
        });

        notificationsAPI.getTemplateFilters().then(function (response) {
            vm.tokenFilterOptions = response.data;
        });

        // not ready for prime time :)
        // appsAPI.getAllProfiles().then(function (response) {
        //     vm.availableProfiles = response.data
        // })

    }

    function getProfileNameForId(id) {
        var profile = vm.availableProfiles.find(function (it) {
            // soft equals is important...they go in as ints and come
            // out as strings
            return it.id == id
        })

        return profile.name
    }

    function update() {
        vm.isWorking = true;

        resourcesAPI.updateEventType($scope.EventTypeDetail.eventType).then(function () {
            vm.isWorking = false;
            vm.isFinishedWorking = true;

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function goToSettingsTab() {
        if ($state.is('eventTypeDetail.settings')) {
            return false;
        }

        $state.go('eventTypeDetail.settings');
    }

    function hasErrors() {
        return (vm.eventType && vm.eventType.title && !vm.eventType.amqpExchange) || (vm.eventType && vm.eventType.deleted) || (vm.eventType && !vm.eventType.resourceType);
    }

    function restore() {
        vm.isRestoring = true;

        resourcesAPI.restoreEventType(vm.eventType.id).then(function (response) {
            vm.eventType = response.data;
            vm.isRestoring = false;
        });
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'eventTypeDetail') {
            $state.go('.compose');
        }
    });

    function closePauseNotificationsForms() {
        vm.isPromptingToPauseNotification = false;
        vm.isPromptingToResumeNotification = false;
    }

    function resumeNotifications() {
        vm.isNotificationsPaused = false;
        vm.eventType.pauseNotifications = false;

        googleAnalytics.trackEvent('Event Type Actions', 'Notifications Resumed',
            $scope.EventTypeDetail.eventType.title + ' (id: ' + $scope.EventTypeDetail.eventType.id + ')');

        update();
        closePauseNotificationsForms();
    }

    function isDefaultEventType() {
        if (!$scope.EventTypeDetail.eventType) {
            return;
        }

        var eventType = $scope.EventTypeDetail.eventType;

        return eventType.id.indexOf('default-type-') > -1;
    }

    function getDefaultExchange() {
        if (!$scope.EventTypeDetail.eventType || !$scope.EventTypeDetail.eventType.resourceType) {
            return;
        }
        var resourceTypeId = $scope.EventTypeDetail.eventType.resourceType.id;

        return 'wwt.' + _.camelCase(resourceTypeId) + '.defaultEventTypeFilesUploaded';
    }

    function getDefaultExchangeForComment() {
        if (!$scope.EventTypeDetail.eventType || !$scope.EventTypeDetail.eventType.resourceType) {
            return;
        }
        var resourceTypeId = $scope.EventTypeDetail.eventType.resourceType.id;

        return 'wwt.' + _.camelCase(resourceTypeId) + '.defaultTypeCommentAdded';
    }

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
