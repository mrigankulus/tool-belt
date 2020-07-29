appModule.controller('PlatformDetailCtrl', makePlatformDetailCtrl);

function makePlatformDetailCtrl($scope, $state, platformsAPI, $timeout, $stateParams, apisAPI, messenger) {
    var vm = this;

    vm.isEditing = false;
    vm.promptToDelete = promptToDelete;
    vm.updatePlatform = updatePlatform;
    vm.createNewEnvironment = createNewEnvironment;
    vm.deleteEnvironment = deleteEnvironment;
    vm.updateEnvironment = updateEnvironment;
    vm.openEditEnvirnment = openEditEnvirnment;

    vm.environmentLabels = ['DEV', 'DEV2', 'TEST', 'PROD'];

    init();

    function init() {
        platformsAPI.getPlatformById($stateParams.id).then(function (response) {
            vm.platform = response.data;
        });

        platformsAPI.getEnvironmentsForPlatform($stateParams.id).then(function (response) {
            vm.environments = response.data;
        });

        getApisForPlatform();
    }

    function getApisForPlatform() {
        apisAPI.getApis().then(function (response) {
            var apis = response.data;

            vm.apis = _.filter(apis, function (it) {
                return it.platform.id === parseInt($stateParams.id);
            });
        });
    }

    function updatePlatform(platform) {
        platformsAPI.updatePlatform(platform).then(function () {
            vm.isEditing = false;
        });
    }

    function createNewEnvironment() {
        platformsAPI.createEnvironment($stateParams.id, vm.newEnvironment).then(function (response) {
            vm.environments.push(response.data);
            vm.isAddingEnvironment = false;
            vm.newEnvironment = {};
        });
    }

    function deleteEnvironment(environment) {
        platformsAPI.deleteEnvironment($stateParams.id, environment.id).then(function () {
            _.remove(vm.environments, {'id': environment.id});
        });
    }

    function updateEnvironment(environment) {
        platformsAPI.updateEnvironment($stateParams.id, environment);
        environment.isEditing = false;
    }

    function openEditEnvirnment(environment) {
        if ($scope.Platforms.canEditPlatforms) {
            environment.isEditing = true;
        }
    }

    function promptToDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Deleting a platform will break any APIs that might be using it. Are you sure you want to do this?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function() {
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

        return platformsAPI.deletePlatform($stateParams.id).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Platform Removed",
                "content": "",
                "isDismissable": false
            });

            $timeout(function () {
                $state.go('^');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });
    }
}
