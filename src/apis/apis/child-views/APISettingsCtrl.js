appModule.controller('APISettingsCtrl', makeAPISettingsCtrl);

function makeAPISettingsCtrl($scope, $timeout, $state, apisAPI, keywordsAPI, assetState, messenger, dashboardSVC, googleAnalytics, hotkeys, featureFlagsSVC) {
    var vm = this;

    vm.update = update;
    vm.deleteApi = deleteApi;
    vm.filterKeywords = filterKeywords;
    vm.changeDefaultVersion = changeDefaultVersion;
    vm.availableKeywords = [];
    vm.filteredKeywords = [];

    // todo: this doesn't appear to be a dynamic list in apirouter, but we should make sure.
    vm.proxyOptions = ['proxy', 'redirect', 'location'];

    init();

    function init() {
        apisAPI.getAvailablePlatforms().then(function (response) {
            vm.availablePlatforms = response.data;
        });

        keywordsAPI.getApiKeywords().then(function (response) {
            vm.availableKeywords = response.data
        })

    }

    function changeDefaultVersion() {
        var message = {
            "type": "warning",
            "title": "Slow Down",
            "content": "This will change the Default Version of this API and might mess things up if others are dependent on a different Default Version. Are you sure you want to do this?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        $scope.APIDetail.api.versionDefault = false
                        messenger.dismissMessage();
                    }
                },
                {
                    title: 'Yes',
                    mood: 'success',
                    actionFunction: onConfirmChange
                }
            ]
        };

        if (assetState.currentAsset.maskedApplicationId) {
            message.content = "Changing the API version can mess things up if others are working on it. This API will now be the default version that all other applications will interact with. Are you sure you want to do this?";

            message.customActions.splice(1, 0, {
                title: 'Review App Link',
                // todo: would like to be able to use a mood other than cancel or success.
                mood: 'cancel',
                actionFunction: function () {
                    $state.go('apiDetail.permissions.maskedApplication');
                    messenger.dismissMessage();
                }
            });
        }

        messenger.showMessage(message);
    }

    function onConfirmChange(){
        messenger.showMessage({
            "type": "warning",
            "title": "Updating",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        return apisAPI.update($scope.APIDetail.api).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "API Updated",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Updated', 'API Updated',
                $scope.APIDetail.api.apiName + ' (id: ' + $scope.APIDetail.api.id + ')');

            $timeout(function () {
                $state.go('apiDetail.versions');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });

    }

    function update() {
        vm.isWorking = true;

        if (!$scope.APIDetail.isCloudFoundryPlatformAPI()) {
            // need to ensure the subdomain is removed as it will be
            // hidden for non-cloudfoundry apis.
            $scope.APIDetail.api.routePrefix = '';
        }
        assetState.currentAsset.update().then(function () {

            vm.isWorking = false;
            vm.isFinishedWorking = true;

            googleAnalytics.trackEvent('Asset Updated', 'API Updated',
                $scope.APIDetail.api.apiName + ' (id: ' + $scope.APIDetail.api.id + ')');

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function formIsValid() {
        if ($scope.APIDetail.isCloudFoundryPlatformAPI()) {
            return $scope.APIDetail.api.apiName &&
                $scope.APIDetail.api.platform &&
                $scope.APIDetail.api.routePrefix &&
                $scope.APIDetail.api.route &&
                $scope.APIDetail.api.description &&
                $scope.APIDetail.api.timeout &&
                $scope.APIDetail.api.routeType;
        } else {
            return $scope.APIDetail.api.apiName &&
                $scope.APIDetail.api.platform &&
                $scope.APIDetail.api.route &&
                $scope.APIDetail.api.description &&
                $scope.APIDetail.api.timeout &&
                $scope.APIDetail.api.routeType;
        }
    }

    function deleteApi() {
        var message = {
            "type": "warning",
            "title": "Slow Down",
            "content": "Deleting an api can mess things up if others are working on it. Are you sure you want to do this?",
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
        };

        if (assetState.currentAsset.maskedApplicationId) {
            message.content = "Deleting an api can mess things up if others are working on it. This API is linked to an application - that application will also be deleted. Are you sure you want to do this?";

            message.customActions.splice(1, 0, {
                title: 'Review App Link',
                // todo: would like to be able to use a mood other than cancel or success.
                mood: 'cancel',
                actionFunction: function () {
                    $state.go('apiDetail.permissions.maskedApplication');
                    messenger.dismissMessage();
                }
            });
        }

        messenger.showMessage(message);
    }

    function onConfirmDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Deleting",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        dashboardSVC.onDeleteItem(assetState.currentAsset);

        return apisAPI.deleteApi($scope.APIDetail.api).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "API Removed",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Deleted', 'API Deleted',
                $scope.APIDetail.api.apiName + ' (id: ' + $scope.APIDetail.api.id + ')');

            $timeout(function () {
                $state.go('apis');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });
    }

    function filterKeywords(search) {
        vm.filteredKeywords = _.filter(vm.availableKeywords, function (it) {
            return _.includes(it.toLowerCase(), search.toLowerCase())
        })
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
                    googleAnalytics.trackEvent('Asset Updated', 'API Updated from hotkey',
                        $scope.APIDetail.api.apiName + ' (id: ' + $scope.APIDetail.api.id + ')');
                }

            }
        });
}
