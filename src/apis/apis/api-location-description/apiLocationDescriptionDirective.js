appModule.directive('apiLocationDescription', apiLocationDescriptionDirective);

function apiLocationDescriptionDirective(wwtEnv) {
    return {
        restrict: 'E',
        templateUrl: 'apis/apis/api-location-description/apiLocationDescription.html',
        scope: {
            api: '='
        },
        link: link
    };

    function link($scope) {
        $scope.getEnvPrefix = function () {
            var env = wwtEnv.getEnv();

            if (env === 'prod' || env === 'prd') {
                return;
            } else if (env === 'local') {
                return '-dev';
            }
            return '-' + env;
        };
        $scope.env = $scope.getEnvPrefix()

        $scope.getAvailableUrlPrefix = function () {
            if ($scope.api.versionDefault == true) {
                return `https://apirouter.apps${$scope.env}.wwt.com/`;
            } else if ($scope.api.validVersion) {
                return `https://apirouter.apps${$scope.env}.wwt.com/v${$scope.api.validVersion}/`;
            } else {
                return `https://apirouter.apps${$scope.env}.wwt.com/v${$scope.api.version}/`;
            }
        };
    }
}
