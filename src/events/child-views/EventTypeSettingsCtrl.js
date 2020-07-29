appModule.controller('EventTypeSettingsCtrl', makeEventTypeSettingsCtrl);

function makeEventTypeSettingsCtrl($scope, $timeout, $state, messenger, resourcesAPI, googleAnalytics, hotkeys, amqpExchangeUtil, appsAPI) {
    var vm = this;

    vm.update = update;
    vm.formIsValid = formIsValid;
    vm.deleteEventType = deleteEventType;
    vm.getIconNameForAppId = getIconNameForAppId;
    vm.getAppNameForAppId = getAppNameForAppId;

    $scope.amqpExchangeUtil = amqpExchangeUtil;

    appsAPI.getApps().then(function (response) {
        vm.apps = response.data;
    });

    function nullOutEmptyExchange(eventType) {
        // if there is no exchange, we want to make it null instead of undefined.
        // this will allow the user to clear the exchange.
        if (!eventType.amqpExchange) {
            eventType.amqpExchange = null;
        }
    }

    function nullOutEmptyRelatedApp(eventType) {
        // if there is no exchange, we want to make it null instead of undefined.
        // this will allow the user to clear the exchange.
        if (!eventType.relatedAppId) {
            eventType.relatedAppId = null;
        }
    }

    function update() {
        vm.isWorking = true;

        if (amqpExchangeUtil.exchangeForEventTypeIsInUse($scope.EventTypeDetail.eventType)) {
            vm.isWorking = false;
            vm.isFinishedWorking = true;
            return;
        }

        nullOutEmptyExchange($scope.EventTypeDetail.eventType);
        nullOutEmptyRelatedApp($scope.EventTypeDetail.eventType);

        resourcesAPI.updateEventType($scope.EventTypeDetail.eventType).then(function () {
            vm.isWorking = false;
            vm.isFinishedWorking = true;

            googleAnalytics.trackEvent('Asset Updated', 'Event Type Updated',
                $scope.EventTypeDetail.eventType.title + ' (id: ' + $scope.EventTypeDetail.eventType.id + ')');

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function formIsValid() {
        return $scope.EventTypeDetail.eventType &&
            $scope.EventTypeDetail.eventType.title &&
            $scope.EventTypeDetail.eventType.id &&
            $scope.EventTypeDetail.eventType.resourceType &&
            $scope.EventTypeDetail.eventType.description;
    }


    function getIconNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return;
        }

        appId = parseInt(appId);

        var app = _.find(vm.apps, {id: appId});

        if (!app) {
            return;
        }

        return app.iconName;
    }

    function getAppNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return;
        }

        appId = parseInt(appId);

        var app = _.find(vm.apps, {id: appId});

        if (!app) {
            return;
        }

        return app.appName;
    }

    function deleteEventType() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to delete this event type?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        messenger.dismissMessage();
                    }
                },
                {
                    title: 'Delete',
                    mood: 'success',
                    actionFunction: onConfirmDelete
                }
            ]
        });
    }

    function onConfirmDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Deleting",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        resourcesAPI.deleteEventType($scope.EventTypeDetail.eventType.id).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Event Type Removed",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Deleted', 'Event Type Deleted',
                $scope.EventTypeDetail.eventType.title + ' (id: ' + $scope.EventTypeDetail.eventType.id + ')');

            $timeout(function () {
                $state.go('eventTypes');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });
    }

    hotkeys.bindTo($scope)
        .add({
            combo: ['command+s', 'ctrl+s'],
            description: 'Save Settings',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function (event, hotkey) {
                event.preventDefault();

                if (formIsValid()) {
                    update();
                    googleAnalytics.trackEvent('Asset Updated', 'Event Type Updated from hotkey',
                        $scope.EventTypeDetail.eventType.title + ' (id: ' + $scope.EventTypeDetail.eventType.id + ')');
                }
            }
        });

}