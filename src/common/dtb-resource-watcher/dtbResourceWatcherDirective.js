// abstracting the wwt resource watcher a bit so the feature flag logic
// doesn't spread to far
appModule.directive('dtbResourceWatcher', function dtbResourceWatcherDirective(wwtEnv) {

    return {
        restrict: 'E',
        templateUrl: 'common/dtb-resource-watcher/dtbResourceWatcher.html',
        scope: {
            dtbResourceWatcherSettings: '='
        },
        link: link
    };

    function link($scope) {
        var currentEnv = wwtEnv.getEnv();

        $scope.shouldShowEnvironmentWarning = function () {
            return currentEnv !== 'prod' && currentEnv !== 'prd';
        };

        $scope.getEnvText = function () {
            if (currentEnv === 'prd' || currentEnv === 'prd') {
                return 'Prod';
            } else if (currentEnv === 'tst' || currentEnv === 'test') {
                return 'Test';
            } else {
                return 'Dev';
            }
        };
    }

});
