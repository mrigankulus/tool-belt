appModule.config(function ($stateProvider) {
    $stateProvider.state('dummyApiRouterTests', {
        url: '/dummy/api-router-tests',
        templateUrl: '_dummy-data/api-router-tests/apiRouterTests.html',
        controller: 'ApiRouterTestsCtrl',
        controllerAs: 'ApiRouterTests',
        data: {
            pageName: 'ApiRouterTests',
            browserTitle: 'ApiRouterTests',
            isSearchable: false
        }
    });
});