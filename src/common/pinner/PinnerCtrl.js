appModule.controller('PinnerCtrl', makePinnerCtrl);

function makePinnerCtrl($scope, assetState, dashboardSVC) {
    var vm = this;

    vm.toggleItemIsPinned = toggleItemIsPinned;
    vm.isInDashboard = isInDashboard;

    $scope.dashboardSVC = dashboardSVC;

    function isInDashboard() {
        var item = {
            type: $scope.assetType,
            data: assetState.currentAsset,
            id: assetState.currentAsset.id
        };

        return dashboardSVC.isInDashboard(item);
    }

    function toggleItemIsPinned() {
        if (!$scope.assetType) {
            throw('Trying to pin an item without providing the assetType');
        }

        var item = {
            type: $scope.assetType,
            data: assetState.currentAsset,
            id: assetState.currentAsset.id
        };

        dashboardSVC.toggleItemIsPinned(item);
    }
}