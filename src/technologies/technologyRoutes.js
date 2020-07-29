appModule.constant('technologyRoutes', function () {
    return [
        { slug: 'about', displayName: 'About', manualRoute: true },
        { slug: 'components', displayName: 'Components' },
        { slug: 'settings', displayName: 'Settings' },
    ];
});

appModule.config(function ($stateProvider, technologyRoutes) {
    $stateProvider.state('technologies', {
        url: '/technologies',
        templateUrl: 'technologies/technologies.html',
        controller: 'TechnologiesCtrl',
        controllerAs: 'Technologies',
        data: {
            pageName: 'technologies',
            browserTitle: 'Technologies',
            isInDotDotDotMenu: true,
            isSearchable: true
        }
    });

    $stateProvider.state('technologyDetail', {
        url: '/technologies/:id',
        templateUrl: 'technologies/technology.html',
        controller: 'TechnologyCtrl',
        controllerAs: 'Technology',
        data: {
            pageName: 'technology',
            browserTitle: 'Technology',
            isInDotDotDotMenu: true
        }
    });

    technologyRoutes().forEach(function (it) {
        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('technologyDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'technologies/child-views/technology' + it.displayName + '.html',
            controller: 'Technology' + it.displayName + 'Ctrl',
            controllerAs: 'Technology' + it.displayName,
            data: {
                pageName: 'technology-' + it.slug,
                browserTitle: it.displayName,
                isInDotDotDotMenu: true
            }
        });

    });

    // --- Manual Routes
    // ---------------------------------------------------
    $stateProvider.state('technologyDetail.about', {
        url: '/about',
        templateUrl: 'common-tabs/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'About',
        data: {
            pageName: 'technology-about',
            browserTitle: 'About',
            isInDotDotDotMenu: true
        }
    });
})
