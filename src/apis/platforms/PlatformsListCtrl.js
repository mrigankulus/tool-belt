appModule.controller('PlatformsListCtrl', makePlatformsListCtrl);

function makePlatformsListCtrl($scope, $state, platformsAPI, userPermissionsAPI) {
    var vm = this;

    vm.newPlatform = {};
    vm.cancelNewPlatform = cancelNewPlatform;
    vm.submitNewPlatform = submitNewPlatform;

    init();

    function init() {
        platformsAPI.getPlatforms().then(function (response) {
            vm.platforms = response.data;
        });
    }

    function submitNewPlatform() {
        platformsAPI.createPlatform(vm.newPlatform).then(function (response) {
            vm.isAddingNew = false;
            vm.platforms.push(response.data);
            $state.go('apis.platforms.platformDetail', {id: response.data.id});
        });
    }

    function cancelNewPlatform() {
        vm.newPlatform = {};
        vm.isAddingNew = false;
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'apis.platforms') {
            $state.go('.list');
        }
    });
}