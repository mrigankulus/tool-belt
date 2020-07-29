appModule.config(function ($stateProvider) {
    $stateProvider.state('dummyDemos', {
        url: '/dummy/demos',
        templateUrl: '_dummy-data/demo-voting/demos.html',
        controller: 'DemosCtrl',
        controllerAs: 'Demos',
        data: {
            pageName: 'Demo',
            browserTitle: 'Demo',
            isSearchable: false
        }
    });
});
