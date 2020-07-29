appModule.constant('apiRoutes', function () {
    return [
        { slug: 'overrides', displayName: 'Overrides', inTabsDotDotDot: false },
        { slug: 'permissions', displayName: 'Permissions', manualRoute: true, inTabsDotDotDot: false },
        { slug: 'relatedRoutes', displayName: 'RelatedRoutes', inTabsDotDotDot: false},
        { slug: 'versions', displayName: 'Versions', inTabsDotDotDot: false},
        { slug: 'scorecard', displayName: 'Scorecard', inTabsDotDotDot: false },
        { slug: 'settings', displayName: 'Settings', inTabsDotDotDot: false }
    ];
});

appModule.config(function ($stateProvider, apiRoutes) {
    $stateProvider.state('apis', {
        url: '/apis',
        templateUrl: 'apis/apis.html',
        controller: 'ApisCtrl',
        controllerAs: 'Apis',
        data: {
            pageName: 'apis',
            browserTitle: 'APIs'
        }
    });

    $stateProvider.state('apis.apisList', {
        url: '/all-apis',
        templateUrl: 'apis/apis/apisList.html',
        controller: 'ApisListCtrl',
        controllerAs: 'ApisList',
        data: {
            pageName: 'apis-list',
            browserTitle: 'APIs',
            isSearchable: true
        }
    });

    $stateProvider.state('apis.platforms', {
        url: '/platforms',
        templateUrl: 'apis/platforms/platforms.html',
        controller: 'PlatformsCtrl',
        controllerAs: 'Platforms',
        data: {
            pageName: 'apis-platforms',
            browserTitle: 'Platforms'
        }
    });

    $stateProvider.state('apis.platforms.list', {
        url: '/all-platforms',
        templateUrl: 'apis/platforms/platformsList.html',
        controller: 'PlatformsListCtrl',
        controllerAs: 'PlatformsList',
        data: {
            pageName: 'apis-platforms',
            browserTitle: 'API Platforms',
            isSearchable: true
        }
    });

    $stateProvider.state('apis.platforms.platformDetail', {
        url: '/:id',
        templateUrl: 'apis/platforms/platformDetail.html',
        controller: 'PlatformDetailCtrl',
        controllerAs: 'PlatformDetail',
        data: {
            pageName: 'platform-detail',
            browserTitle: 'Platform'
        }
    });

    $stateProvider.state('apiDetail', {
        url: '/api/:id',
        templateUrl: 'apis/apis/apiDetail.html',
        controller: 'APIDetailCtrl',
        controllerAs: 'APIDetail',
        data: {
            pageName: 'APIDetail',
            browserTitle: 'API'
        }
    });

    apiRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('apiDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'apis/apis/child-views/api' + it.displayName + '.html',
            controller: 'API' + it.displayName + 'Ctrl',
            controllerAs: 'API' + it.displayName,
            data: {
                pageName: 'api-' + it.slug,
                browserTitle: _.startCase(it.displayName),
                inTabsDotDotDot: it.inTabsDotDotDot
            }
        });

    });


    // --- Manual Routes
    // ---------------------------------------------------

    $stateProvider.state('apiDetail.permissions', {
        url: '/permissions',
        templateUrl: 'common-tabs/applicationPermissions/permissions/linkApplication.html',
        controller: 'LinkApplicationCtrl',
        controllerAs: 'LinkApplication',
        data: {
            pageName: 'api-permissions',
            browserTitle: 'Permissions',
            inTabsDotDotDot: false
        }
    });
});
