appModule.controller('FeatureFlagsCtrl', makeFeatureFlagsCtrl);

function makeFeatureFlagsCtrl($scope, featureFlagsSVC) {
    var vm = this;

    vm.onFlagChange = onFlagChange;

    $scope.featureFlagsSVC = featureFlagsSVC;

    function onFlagChange() {
        featureFlagsSVC.saveFlags();
    }
}