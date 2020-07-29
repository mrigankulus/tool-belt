appModule.controller('ApplicationSettingsCtrl', makeApplicationSettingsCtrl);

function makeApplicationSettingsCtrl($scope, $timeout, $state, appsAPI, assetState, messenger, dashboardSVC, googleAnalytics, hotkeys) {
    var vm = this;

    vm.update = update;
    vm.deleteApplication = deleteApplication;

    $scope.assetState = assetState;

    function update() {
        vm.isWorking = true;

        assetState.currentAsset.update($scope.Application.application).then(function () {
            vm.isWorking = false;
            vm.isFinishedWorking = true;

            googleAnalytics.trackEvent('Asset Updated', 'Application Updated',
                $scope.Application.application.appName + ' (id: ' + $scope.Application.application.id + ')');

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function formIsValid() {
        return $scope.assetState.currentAsset.appName &&
            $scope.assetState.currentAsset.displayName &&
            $scope.assetState.currentAsset.iconName &&
            $scope.assetState.currentAsset.appLocation &&
            $scope.assetState.currentAsset.appDescription;
    }

    function deleteApplication() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Deleting an application cannot be undone. Are you sure you want to do this?",
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

        dashboardSVC.onDeleteItem($scope.Application.application);

        appsAPI.deleteApplication($scope.Application.application.id).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Application Removed",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Deleted', 'Application Deleted',
                $scope.Application.application.appName + ' (id: ' + $scope.Application.application.id + ')');

            $timeout(function () {
                $state.go('applications');
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
                    googleAnalytics.trackEvent('Asset Updated', 'Application Updated from hotkey',
                        $scope.Application.application.appName + ' (id: ' + $scope.Application.application.id + ')');
                }
            }
        });
}
