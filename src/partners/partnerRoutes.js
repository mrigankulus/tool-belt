appModule.constant('partnerRoutes', function () {
    return [
        {slug: 'profiles-users', displayName: 'ProfilesUsers'},
        {slug: 'settings', displayName: 'Settings'}
    ];
});

appModule.config(function ($stateProvider, partnerRoutes) {

    $stateProvider.state('partners', {
        url: '/partners',
        templateUrl: 'partners/partners.html',
        controller: 'PartnersCtrl',
        controllerAs: 'Partners',
        data: {
            pageName: 'partners',
            browserTitle: 'Partners',
            isInDotDotDotMenu: true,
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewPartners'
        }
    });

    $stateProvider.state('partnerDetail', {
        url: '/partners/:partnerId',
        templateUrl: 'partners/partnerDetail.html',
        controller: 'PartnerDetailCtrl',
        controllerAs: 'PartnerDetail',
        data: {
            pageName: 'partner-detail',
            browserTitle: 'Partner',
            isInDotDotDotMenu: true
        }
    });

    partnerRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('partnerDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'partners/child-views/partner' + it.displayName + '.html',
            controller: 'Partner' + it.displayName + 'Ctrl',
            controllerAs: 'Partner' + it.displayName,
            data: {
                pageName: 'partners-' + it.slug,
                browserTitle: it.displayName,
                isInDotDotDotMenu: true
            }
        });

    });

});
