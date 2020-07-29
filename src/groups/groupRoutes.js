appModule.config(function ($stateProvider) {

    $stateProvider.state('groups', {
        url: '/groups',
        templateUrl: 'groups/groupsLanding.html',
        controller: 'GroupsLandingCtrl',
        controllerAs: '$ctrl',
        data: {
            pageName: 'groups-landing',
            browserTitle: 'Groups',
            isSearchable: true
        }
    })

    $stateProvider.state('groups.groupTypes', {
        url: '/types',
        templateUrl: 'groups/group-types/groupTypes.html',
        controller: 'GroupTypesCtrl',
        controllerAs: '$ctrl',
        data: {
            pageName: 'group-types',
            browserTitle: 'Group Types',
            isSearchable: true
        }
    })

    $stateProvider.state('groups.groupTypeDetail', {
        url: '/types/:id',
        templateUrl: 'groups/group-types/groupTypeDetail.html',
        controller: 'GroupTypeDetailCtrl',
        controllerAs: '$ctrl',
        data: {
            pageName: 'group-type-detail',
            browserTitle: 'Group Type',
            isSearchable: true
        }
    })

    $stateProvider.state('groups.groupDetail', {
        url: '/groups/:id',
        templateUrl: 'groups/groups/groupDetail.html',
        controller: 'GroupDetailCtrl',
        controllerAs: '$ctrl',
        data: {
            pageName: 'group-detail',
            browserTitle: 'Group',
            isSearchable: true
        }
    })

    $stateProvider.state('profileToGroupTransition', {
        url: '/profile-to-group-transition',
        template: '<div class="container" style="max-width: 800px;"><div class="item-detail-content" style="padding-top: 20px;"><about-groups></about-groups></div></div>',
        data: {
            pageName: 'profile-to-group-transition',
            browserTitle: 'Profiles to Groups',
            isSearchable: true
        }
    })
})
