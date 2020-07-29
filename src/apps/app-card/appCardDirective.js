appModule.directive('appCard', function appCardCirective() {

    return {
        restrict: 'E',
        templateUrl: 'apps/app-card/appCard.html',
        controller: 'AppCardCtrl',
        controllerAs: 'AppCard',
        replace: true,
        scope: {
            app: '='
        }
    };

});