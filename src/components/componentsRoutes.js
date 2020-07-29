appModule.constant('componentsRoutes', function () {
    return [
        { slug: 'activity', displayName: 'Activity', manualRoute: true },
        { slug: 'about', displayName: 'About', manualRoute: true },
        { slug: 'versions', displayName: 'Versions' },
        { slug: 'screenshots', displayName: 'Screenshots' },
        { slug: 'dependencies', displayName: 'Dependencies', manualRoute: true },
        { slug: 'settings', displayName: 'Settings' },
    ];
});

appModule.config(function ($stateProvider, componentsRoutes) {
    $stateProvider.state('components', {
        url: '/components',
        templateUrl: 'components/components.html',
        controller: 'ComponentsCtrl',
        controllerAs: 'Components',
        data: {
            pageName: 'components',
            browserTitle: 'Components',
            isSearchable: true
        }
    });

    $stateProvider.state('componentDetail', {
        url: '/component/:id',
        templateUrl: 'components/componentDetail.html',
        controller: 'ComponentDetailCtrl',
        controllerAs: 'Component',
        data: {
            pageName: 'component',
            browserTitle: 'Component'
        }
    });

    componentsRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('componentDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'components/child-views/component' + it.displayName + '.html',
            controller: 'Component' + it.displayName + 'Ctrl',
            controllerAs: 'Component' + it.displayName,
            data: {
                pageName: 'component-' + it.slug,
                browserTitle: it.displayName
            }
        });

    });


    // --- Manual Routes
    // ---------------------------------------------------

    $stateProvider.state('componentDetail.activity', {
        url: '/activity',
        templateUrl: 'common-tabs/asset-activity/activity.html',
        controller: 'ActivityCtrl',
        controllerAs: 'Activity',
        data: {
            pageName: 'componentDetail-activity',
            browserTitle: 'Activity'
        }
    });

    $stateProvider.state('componentDetail.about', {
        url: '/about',
        templateUrl: 'common-tabs/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'About',
        data: {
            pageName: 'component-about',
            browserTitle: 'About'
        }
    });

    $stateProvider.state('componentDetail.dependencies', {
        url: '/dependencies',
        templateUrl: 'common-tabs/dependencyList.html',
        controller: 'DependencyListCtrl',
        controllerAs: 'DependencyList',
        data: {
            pageName: 'component-dependencies',
            browserTitle: 'Dependencies'
        }
    });

});
