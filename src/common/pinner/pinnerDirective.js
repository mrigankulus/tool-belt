appModule.directive('pinner', function pinnerDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/pinner/pinner.html',
        controller: 'PinnerCtrl',
        controllerAs: 'Pinner',
        scope: {
            assetType: '@'
        }
    };

});