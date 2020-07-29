appModule.config(function ($stateProvider) {
    var routes = ['application', 'api'];

    $stateProvider.state('apiDetail.permissions.maskedApplication', {
        url: '/masked-application',
        templateUrl: 'common-tabs/applicationPermissions/permissions/linkApplication.html',
        controller: 'LinkApplicationCtrl',
        controllerAs: 'LinkApplication',
        data: {
            pageName: 'api-linked-application',
            browserTitle: 'Linked Application',
            disabledDashboardJumpto: true
        }
    });

    routes.forEach(function (it) {
        $stateProvider.state(it + 'Detail.permissions.manage', {
            url: '/manage',
            templateUrl: 'common-tabs/applicationPermissions/permissions/manage.html',
            data: {
                pageName: it + '-permissions',
                browserTitle: 'Permissions',
                disabledDashboardJumpto: true
            }
        });

        $stateProvider.state(it + 'Detail.permissions.ui', {
            url: '/ui-implementation',
            templateUrl: 'common-tabs/applicationPermissions/permissions/implementations/uiImplementation.html',
            data: {
                pageName: it + '-permissions-ui-implementation',
                browserTitle: 'Permissions UI Implementation',
                disabledDashboardJumpto: true
            }
        });

        $stateProvider.state(it + 'Detail.permissions.grails', {
            url: '/grails-implementation',
            templateUrl: 'common-tabs/applicationPermissions/permissions/implementations/grailsImplementation.html',
            data: {
                pageName: it + '-permissions-grails-implementation',
                browserTitle: 'Permissions Grails Implementation',
                disabledDashboardJumpto: true
            }
        });

        $stateProvider.state(it + 'Detail.permissions.node', {
            url: '/node-implementation',
            templateUrl: 'common-tabs/applicationPermissions/permissions/implementations/nodeImplementation.html',
            data: {
                pageName: it + '-permissions-node-implementation',
                browserTitle: 'Permissions Node Implementation',
                disabledDashboardJumpto: true
            }
        });

        $stateProvider.state(it + 'Detail.permissions.users', {
            url: '/users',
            templateUrl: 'common-tabs/applicationPermissions/permissions/users.html',
            data: {
                pageName: it + '-permissions-users',
                browserTitle: 'Permitted Users',
                disabledDashboardJumpto: true
            }
        });

        $stateProvider.state(it + 'Detail.permissions.customers', {
            url: '/customers',
            templateUrl: 'common-tabs/applicationPermissions/permissions/customers.html',
            data: {
                pageName: it + '-permissions-customers',
                browserTitle: 'Permitted Customers',
                disabledDashboardJumpto: true
            }
        });

    });
});
