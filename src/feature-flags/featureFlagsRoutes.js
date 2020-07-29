appModule.config(function ($stateProvider) {
    $stateProvider.state('featureFlags', {
        url: '/feature-flags',
        templateUrl: 'feature-flags/featureFlags.html',
        controller: 'FeatureFlagsCtrl',
        controllerAs: 'FeatureFlags',
        data: {
            pageName: 'feature-flags',
            browserTitle: 'Feature Flags'
        }
    });
});