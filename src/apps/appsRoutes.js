appModule.constant('appRoutes', function () {
    return [
        { slug: 'activity', displayName: 'Activity', manualRoute: true, inTabsDotDotDot: false, isDeveloperOnlyView: true },
        { slug: 'about', displayName: 'About', manualRoute: true, inTabsDotDotDot: false, isDeveloperOnlyView: true },
        { slug: 'managed-routes', displayName: 'Managed Routes', inTabsDotDotDot: true, isDeveloperOnlyView: true },
        { slug: 'screenshots', displayName: 'Screenshots', inTabsDotDotDot: false, isDeveloperOnlyView: true },
        { slug: 'analytics', displayName: 'Analytics', inTabsDotDotDot: false, isDeveloperOnlyView: true },
        { slug: 'permissions', displayName: 'Permissions', manualRoute: true, inTabsDotDotDot: false, isDeveloperOnlyView: false },
        { slug: 'release-notes', displayName: 'Release Notes', inTabsDotDotDot: true, isDeveloperOnlyView: true },
        { slug: 'dependencies', displayName: 'Dependencies', inTabsDotDotDot: true, manualRoute: true, isDeveloperOnlyView: true },
        { slug: 'translations', displayName: 'Translations', inTabsDotDotDot: true, manualRoute: true, isDeveloperOnlyView: true },
        { slug: 'settings', displayName: 'Settings', inTabsDotDotDot: false, isDeveloperOnlyView: false }
    ];
});

appModule.config(function ($stateProvider, appRoutes) {
    $stateProvider.state('applications', {
        url: '/apps',
        templateUrl: 'apps/apps.html',
        controller: 'AppsCtrl',
        controllerAs: 'Apps',
        data: {
            pageName: 'apps',
            browserTitle: 'Applications',
            isSearchable: true
        }
    });

    $stateProvider.state('applicationDetail', {
        url: '/application/:id',
        templateUrl: 'apps/applicationDetail.html',
        controller: 'ApplicationDetailCtrl',
        controllerAs: 'Application',
        data: {
            pageName: 'Application',
            browserTitle: 'Application'
        }
    });

    appRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        // remove spaces from displayName for template URLs
        const displayName = it.displayName.replace(' ', '')

        $stateProvider.state('applicationDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'apps/child-views/application' + displayName + '.html',
            controller: 'Application' + displayName + 'Ctrl',
            controllerAs: 'Application' + displayName,
            data: {
                pageName: 'application-' + it.slug,
                browserTitle: it.displayName,
                isDeveloperOnlyView: it.isDeveloperOnlyView,
                inTabsDotDotDot: it.inTabsDotDotDot
            }
        });

    });


    // --- Manual Routes
    // ---------------------------------------------------

    $stateProvider.state('applicationDetail.analytics.pageViews', {
        url: '/page-views',
        templateUrl: 'apps/child-views/analytics/analyticsPageViews.html',
        controller: 'AnalyticsPageViewsCtrl',
        controllerAs: 'AnalyticsPageViews',
        data: {
            pageName: 'application-page-views',
            browserTitle: 'Page Views',
            isDeveloperOnlyView: true,
            inTabsDotDotDot: false
        }
    });

    $stateProvider.state('applicationDetail.analytics.events', {
        url: '/events',
        templateUrl: 'apps/child-views/analytics/analyticsEvents.html',
        controller: 'AnalyticsEventsCtrl',
        controllerAs: 'AnalyticsEvents',
        data: {
            pageName: 'analytics-events',
            browserTitle: 'Events',
            isDeveloperOnlyView: true,
            inTabsDotDotDot: false
        }
    });

    $stateProvider.state('applicationDetail.activity', {
        url: '/activity',
        templateUrl: 'common-tabs/asset-activity/activity.html',
        controller: 'ActivityCtrl',
        controllerAs: 'Activity',
        data: {
            pageName: 'application-activity',
            browserTitle: 'Activity',
            isDeveloperOnlyView: true,
            inTabsDotDotDot: false
        }
    });

    $stateProvider.state('applicationDetail.about', {
        url: '/about',
        templateUrl: 'common-tabs/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'About',
        data: {
            pageName: 'application-about',
            browserTitle: 'About',
            isDeveloperOnlyView: true,
            inTabsDotDotDot: false
        }
    });

    $stateProvider.state('applicationDetail.permissions', {
        url: '/permissions',
        templateUrl: 'common-tabs/applicationPermissions/applicationPermissions.html',
        controller: 'ApplicationPermissionsCtrl',
        controllerAs: 'ApplicationPermissions',
        data: {
            pageName: 'application-permissions',
            browserTitle: 'Permissions',
            isDeveloperOnlyView: false,
            inTabsDotDotDot: false
        }
    });

    $stateProvider.state('applicationDetail.dependencies', {
        url: '/dependencies',
        templateUrl: 'common-tabs/dependencyList.html',
        controller: 'DependencyListCtrl',
        controllerAs: 'DependencyList',
        data: {
            pageName: 'application-dependencies',
            browserTitle: 'Dependencies',
            isDeveloperOnlyView: true,
            inTabsDotDotDot: true
        }
    });

    $stateProvider.state('applicationDetail.translations', {
        url: '/translations',
        templateUrl: 'translations/translations.html',
        controller: 'TranslationsCtrl',
        controllerAs: 'Translations',
        data: {
            pageName: 'application-translations',
            browserTitle: 'Translations',
            isDeveloperOnlyView: true,
            inTabsDotDotDot: true
        }
    });

});
