appModule.config(function ($stateProvider) {
    $stateProvider.state('postRefresh', {
        url: '/post-refresh',
        templateUrl: 'post-refresh/postRefresh.html',
        controller: 'PostRefreshCtrl',
        controllerAs: 'PostRefresh',
        data: {
            pageName: 'post-refresh',
            browserTitle: 'Post Refresh',
            isSearchable: true
        }
    });
});
