appModule.constant('usersRoutes', function () {
    return [
        { slug: 'groups', displayName: 'Groups' },
        { slug: 'profiles', displayName: 'Profiles' },
        { slug: 'applications', displayName: 'Applications' },
        { slug: 'partners', displayName: 'Partners' },
        { slug: 'analytics', displayName: 'Analytics' },
        { slug: 'settings', displayName: 'Settings' }
    ];
});

appModule.config(function ($stateProvider, usersRoutes) {

    $stateProvider.state('users', {
        url: '/users',
        templateUrl: 'users/users.html',
        controller: 'UsersCtrl',
        controllerAs: 'Users',
        data: {
            pageName: 'users',
            browserTitle: 'Users',
            isInDotDotDotMenu: true,
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewUsers'
        }
    });

    $stateProvider.state('userDetail', {
        url: '/user/:userName',
        templateUrl: 'users/userDetail.html',
        controller: 'UserDetailCtrl',
        controllerAs: 'UserDetail',
        data: {
            pageName: 'user-detail',
            browserTitle: 'User',
            isInDotDotDotMenu: true
        }
    });

    usersRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('userDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'users/child-views/user' + it.displayName + '.html',
            controller: 'User' + it.displayName + 'Ctrl',
            controllerAs: 'User' + it.displayName,
            data: {
                pageName: 'users-' + it.slug,
                browserTitle: it.displayName,
                isInDotDotDotMenu: true
            }
        });

    });

});
