appModule.directive('partnerCard', function partnerCardDirective() {

    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'partners/partner-card/partnerCard.html',
        controller: 'PartnerCardCtrl',
        controllerAs: 'PartnerCard',
        replace: true,
        scope: {
            partner: '='
        }
    };

});
