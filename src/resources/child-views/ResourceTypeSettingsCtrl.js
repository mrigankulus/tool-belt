appModule.controller('ResourceTypeSettingsCtrl', makeResourceTypeSettingsCtrl);

function makeResourceTypeSettingsCtrl($scope, $timeout, resourcesAPI, messenger, $state, googleAnalytics, hotkeys) {
    var vm = this;

    vm.update = update;
    vm.formIsValid = formIsValid;
    vm.deleteResourceType = deleteResourceType;

    function update() {
        vm.isUpdatingResourceType = true;
        vm.hasUpdatedResourceType = false;

        resourcesAPI.updateResourceType($scope.ResourceTypeDetail.resourceType).then(function () {
            vm.isUpdatingResourceType = false;
            vm.hasUpdatedResourceType = true;

            googleAnalytics.trackEvent('Asset Updated', 'Resource Type Updated',
                $scope.ResourceTypeDetail.resourceType.title + ' (id: ' + $scope.ResourceTypeDetail.resourceType.id + ')');

            $timeout(function () {
                vm.hasUpdatedResourceType = false;
            }, 500);
        });
    }

    function formIsValid() {
        return $scope.ResourceTypeDetail.resourceType &&
            $scope.ResourceTypeDetail.resourceType.title &&
            $scope.ResourceTypeDetail.resourceType.id &&
            $scope.ResourceTypeDetail.resourceType.description;
    }

    function deleteResourceType() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to delete this resource type? Associated event types will also be deleted.",
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

        resourcesAPI.deleteResourceType($scope.ResourceTypeDetail.resourceType.id).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Resource Type Removed",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Deleted', 'Resource Type Deleted',
                $scope.ResourceTypeDetail.resourceType.title + ' (id: ' + $scope.ResourceTypeDetail.resourceType.id + ')');

            $timeout(function () {
                $state.go('resourceTypes');
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
                    googleAnalytics.trackEvent('Asset Updated', 'Resource Type Updated from hotkey',
                        $scope.ResourceTypeDetail.resourceType.title + ' (id: ' + $scope.ResourceTypeDetail.resourceType.id + ')');
                }
            }
        });
}