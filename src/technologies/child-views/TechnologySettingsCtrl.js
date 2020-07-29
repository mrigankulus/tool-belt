appModule.controller('TechnologySettingsCtrl', makeTechnologySettingsCtrl)

function makeTechnologySettingsCtrl($scope, $timeout, $state, assetState, messenger, technologiesApi, googleAnalytics) {
    var vm = this

    vm.deleteTech = deleteTech
    vm.update = update

    $scope.assetState = assetState
    $scope.$watch('Technology.technology', init)

    function init() {
        if (!_.get($scope.Technology, 'technology')) {
            return
        }

        vm.technology = $scope.Technology.technology
    }

    function update() {
        vm.isWorking = true;

        googleAnalytics.trackEvent('Asset Updated', 'Technology Updated',
            $scope.Technology.technology.name + ' (id: ' + $scope.Technology.technology.id + ')');

        assetState.currentAsset.update().then(function () {
            vm.isWorking = false;
            vm.isFinishedWorking = true;

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function deleteTech() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you want to delete this technology?",
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

        return technologiesApi.delete($scope.Technology.technology).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Technology Removed",
                "content": "",
                "isDismissable": false
            });

            googleAnalytics.trackEvent('Asset Deleted', 'Technology Deleted',
                $scope.Technology.technology.name + ' (id: ' + $scope.Technology.technology.id + ')')

            $timeout(function () {
                $state.go('technologies');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });
    }
}