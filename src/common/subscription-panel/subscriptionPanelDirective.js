// NOTE! This directive is the "inside" of the panel. It does not yet support
// the opening/closing of the panel.
appModule.directive('subscriptionPanel', function subscriptionPanelDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/subscription-panel/subscriptionPanel.html',
        controller: 'SubscriptionPanelCtrl',
        controllerAs: 'SubscriptionPanel',
        scope: {
            subscriber: '=',
            subscribers: '=',
            resourceType: '='
        }
    };

});
