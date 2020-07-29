appModule.controller('JenkinsWidgetCtrl', makeJenkinsWidgetCtrl);

function makeJenkinsWidgetCtrl($scope, $q, jenkinsAPI, assetState) {
    var vm = this;

    $scope.assetState = assetState;

    $scope.$watch('asset', init, true);

    function init() {
        if (!$scope.asset || !$scope.asset.connectedJenkinsJobs) {
            return false;
        }

        var jobs = assetState.currentAsset.connectedJenkinsJobs;

        var requests = [];

        jobs.forEach(function (it) {
            requests.push(jenkinsAPI.getJobAndLastBuild('Custom Apps', it.name));
        });

        $q.all(requests).then(function (response) {
            vm.jobs = response;
        });
    }
}
