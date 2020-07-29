appModule.controller('ApisCtrl', makeApisCtrl);

function makeApisCtrl($scope, $state, envExtended) {
    var vm = this;

    vm.watcherSettings = {
        resourceTypeId: 'dev-asset-type',
        resourceId: 'api',
        watchText: 'Watch for New APIs',
        unWatchText: 'Stop Watching for New APIs',
        position: 'alignRight'
    };

    $scope.envExtended = envExtended;

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'apis') {
            $state.go('.apisList');
        }
    });

}