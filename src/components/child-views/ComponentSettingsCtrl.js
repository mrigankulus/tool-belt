appModule.controller('ComponentSettingsCtrl', makeComponentSettingsCtrl);

function makeComponentSettingsCtrl($scope, $timeout, $state, componentsAPI, assetState, assetGroups, dashboardSVC, messenger, googleAnalytics, technologiesApi, hotkeys) {
    var vm = this;

    vm.update = update;
    vm.delete = deleteComponent;
    vm.searchTechnologies = searchTechnologies
    vm.availableTechnologies = []

    $scope.assetState = assetState;

    function update() {
        vm.isWorking = true;
        googleAnalytics.trackEvent('Asset Updated', 'Component Updated',
            $scope.Component.component.name + ' (id: ' + $scope.Component.component.id + ')');

        assetState.currentAsset.update().then(function () {
            vm.isWorking = false;
            vm.isFinishedWorking = true;

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function formIsValid() {
        return $scope.assetState.currentAsset.name &&
            $scope.assetState.currentAsset.id &&
            $scope.assetState.currentAsset.iconName &&
            $scope.assetState.currentAsset.shortDescription;
    }

    function deleteComponent() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you want to delete this component?",
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

        dashboardSVC.onDeleteItem(assetState.currentAsset);

        return componentsAPI.delete($scope.Component.component).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Component Removed",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Deleted', 'Component Deleted',
                $scope.Component.component.name + ' (id: ' + $scope.Component.component.id + ')');

            $timeout(function () {
                $state.go('components');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });
    }

    function searchTechnologies() {
        technologiesApi.get().then(function (response) {
            vm.availableTechnologies = response.data
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
                    googleAnalytics.trackEvent('Asset Updated', 'Component Updated from hotkey',
                        $scope.Component.component.name + ' (id: ' + $scope.Component.component.id + ')');
                }
            }
        });

}
