appModule.constant('sharedSocketsRoutes', function () {
    return [
        // { slug: 'roles', displayName: 'Roles' }
    ];
});

appModule.config(function ($stateProvider, sharedSocketsRoutes) {

    $stateProvider.state('sharedSockets', {
        url: '/shared-sockets',
        templateUrl: 'shared-sockets/sharedSockets.html',
        controller: 'SharedSocketsCtrl',
        controllerAs: 'Sockets',
        data: {
            pageName: 'shared-sockets',
            browserTitle: 'Shared Sockets',
            isInDotDotDotMenu: true,
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewSockets',
            restrictToFeatureFlag: 'websockets'
        }
    });

    sharedSocketsRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('sharedSocketDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'shared-sockets/child-views/profile' + it.displayName + '.html',
            controller: 'SharedSockets' + it.displayName + 'Ctrl',
            controllerAs: 'Sockets' + it.displayName,
            data: {
                pageName: 'shared-sockets-' + it.slug,
                browserTitle: it.displayName,
                isInDotDotDotMenu: true
            }
        });

    });

});
