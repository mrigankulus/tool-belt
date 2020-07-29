appModule.constant('resourcesRoutes', function () {
    return [
        {slug: 'event-types', displayName: 'EventTypes'},
        {slug: 'subscriptions', displayName: 'Subscriptions'},
        {slug: 'analytics', displayName: 'Analytics'},
        {slug: 'associations', displayName: 'Associations'},
        {slug: 'settings', displayName: 'Settings'}
    ];
});

appModule.config(function ($stateProvider, resourcesRoutes) {

    $stateProvider.state('resourceTypes', {
        url: '/resource-types',
        templateUrl: 'resources/resourceTypes.html',
        controller: 'ResourceTypesCtrl',
        controllerAs: 'ResourceTypes',
        data: {
            pageName: 'resource-types',
            browserTitle: 'Resource Types',
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewResources'
        }
    });

    $stateProvider.state('resourceTypeDetail', {
        url: '/resource-types/:id',
        templateUrl: 'resources/resourceTypeDetail.html',
        controller: 'ResourceTypeDetailCtrl',
        controllerAs: 'ResourceTypeDetail',
        data: {
            pageName: 'resource-types-detail',
            browserTitle: 'Resource Type'
        }
    });

    resourcesRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('resourceTypeDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'resources/child-views/resourceType' + it.displayName + '.html',
            controller: 'ResourceType' + it.displayName + 'Ctrl',
            controllerAs: 'ResourceType' + it.displayName,
            data: {
                pageName: 'resources-' + it.slug,
                browserTitle: _.startCase(it.displayName)
            }
        });

    });

});
