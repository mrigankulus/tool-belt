appModule.directive('technologyCard', function technologyCardDirective() {

    return {
        restrict: 'E',
        templateUrl: 'technologies/technology-card/technologyCard.html',
        controller: 'TechnologyCardCtrl',
        controllerAs: 'TechnologyCard',
        replace: true,
        scope: {
            technology: '='
        }
    };

});