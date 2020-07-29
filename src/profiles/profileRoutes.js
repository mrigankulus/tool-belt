appModule.constant('profileRoutes', function () {
    return [
        { slug: 'roles', displayName: 'Roles' },
        { slug: 'users', displayName: 'Users' },
        { slug: 'partners', displayName: 'Partners' },
        // { slug: 'applications', displayName: 'Applications' },

        { slug: 'user-approval-roles', displayName: 'UserApprovalRoles' },
        { slug: 'legacy-customers', displayName: 'LegacyCustomers' },
        { slug: 'report-roles', displayName: 'ReportRoles' },
        { slug: 'settings', displayName: 'Settings' }
    ];
});

appModule.config(function ($stateProvider, profileRoutes) {

    $stateProvider.state('profiles', {
        url: '/profiles',
        templateUrl: 'profiles/profiles.html',
        controller: 'ProfilesCtrl',
        controllerAs: 'Profiles',
        data: {
            pageName: 'profiles',
            browserTitle: 'Profiles',
            isInDotDotDotMenu: true,
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewProfiles'
        }
    });

    $stateProvider.state('profileDetail', {
        url: '/profile/:profileId',
        templateUrl: 'profiles/profileDetail.html',
        controller: 'ProfileDetailCtrl',
        controllerAs: 'ProfileDetail',
        data: {
            pageName: 'profile-detail',
            browserTitle: 'Profile',
            isInDotDotDotMenu: true
        }
    });

    profileRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('profileDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'profiles/child-views/profile' + it.displayName + '.html',
            controller: 'Profile' + it.displayName + 'Ctrl',
            controllerAs: 'Profile' + it.displayName,
            data: {
                pageName: 'profiles-' + it.slug,
                browserTitle: it.displayName,
                isInDotDotDotMenu: true
            }
        });

    });

});
