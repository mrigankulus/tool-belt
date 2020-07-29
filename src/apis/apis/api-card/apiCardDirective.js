appModule.directive('apiCard', function apiCardCirective() {

    return {
        restrict: 'E',
        templateUrl: 'apis/apis/api-card/apiCard.html',
        controller: 'ApiCardCtrl',
        controllerAs: 'ApiCard',
        replace: true,
        scope: {
            api: '=',
            includesIcon: '='
        }
    };

});