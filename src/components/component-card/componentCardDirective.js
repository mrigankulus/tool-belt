appModule.directive('componentCard', function componentCardDirective() {

    return {
        restrict: 'E',
        templateUrl: 'components/component-card/componentCard.html',
        controller: 'ComponentCardCtrl',
        controllerAs: 'ComponentCard',
        replace: true,
        scope: {
            component: '='
        }
    };

});