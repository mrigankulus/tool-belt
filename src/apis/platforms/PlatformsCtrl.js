appModule.controller('PlatformsCtrl', makePlatformsCtrl);

function makePlatformsCtrl($scope, $state, userPermissionsAPI) {
    var vm = this;

    init();

    function init() {
         userPermissionsAPI.canEditPlatforms().then(function (response) {
            vm.canEditPlatforms = response;
            vm.permissionsHaveLoaded = true;
        });
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'apis.platforms') {
            $state.go('.list');
        }
    });
}