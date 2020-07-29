appModule.directive('connectedItemsList', function makeconnectedItemsList() {

    return {
        restrict: 'E',
        templateUrl: 'common/connected-items-list/connectedItemsList.html',
        controller: 'ConnectedItemsListCtrl',
        controllerAs: 'ConnectedItems',
        scope: {
            asset: '=',
            updateFn: '='
        }
    };

});
