appModule.controller('wwtEnvTestCtrl', function ($scope, wwtEnv) {
    $scope.wwtEnv = wwtEnv;
    window.wwtEnv = wwtEnv;

    $scope.wwtEnvAPILookup = 'gossip-api';
});

appModule.config(function ($stateProvider) {

    $stateProvider.state('wwtEnvTest', {
        url: '/wwt-env-test',
        templateUrl: '_dummy-data/wwt-env-test/wwtEnvTest.html',
        controller: 'wwtEnvTestCtrl',
        data: {
            pageName: 'just-testing',
        }
    });

});
