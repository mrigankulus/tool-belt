appModule.directive('wwtIconTypeAhead', function wwtIconTypeAhead() {

    return {
        restrict: 'E',
        templateUrl: 'common/wwt-icons/wwtIconTypeAhead.html',
        controller: 'WwtIconTypeAheadCtrl',
        controllerAs: 'WWTIconTypeAhead',
        scope: {
            targetModel: '=',
            placeholder: '='
        }
    };

});