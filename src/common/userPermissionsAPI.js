appModule.factory('userPermissionsAPI', makeUserPermissionsAPI);

function makeUserPermissionsAPI($http, $q, wwtEnv) {
    var userPermissionsAPI = {},
        baseURL = wwtEnv.getApiForwardUrl() + '/user';

    userPermissionsAPI.getPermissionsForApp = function (appName) {
        return $http.get(baseURL + '?appName=' + appName, {cache: true}).then(function (repsonse) {
            return repsonse.data ? repsonse.data.permissions : [];
        });

    };

    userPermissionsAPI.getAllPermissions = function () {
        // Getting them all will cache them all. This can make the ui super snappy.
        return $q.all([
            userPermissionsAPI.isDeveloper(),
            userPermissionsAPI.canEditApps(),
            userPermissionsAPI.canEditApis(),
            userPermissionsAPI.canEditComponents(),
            userPermissionsAPI.canEditPlatforms(),
            userPermissionsAPI.canApplyProfiles(),
            userPermissionsAPI.canApplyPartners(),
            userPermissionsAPI.canApplyUsers(),
            userPermissionsAPI.canViewResources(),
            userPermissionsAPI.canViewEvents(),
            userPermissionsAPI.canViewProfiles(),
            userPermissionsAPI.canViewUsers(),
            userPermissionsAPI.canViewPartners(),
            userPermissionsAPI.canViewCronJobs(),
            userPermissionsAPI.canViewSockets(),
            userPermissionsAPI.canViewTechnologies(),
            userPermissionsAPI.canManageTaskTypes(),
            userPermissionsAPI.canViewAllGroups()
        ]);
    };

    userPermissionsAPI.canEditApps = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('Applications Admin') > -1;
        });
    };

    userPermissionsAPI.isDeveloper = function () {
        return userPermissionsAPI.canEditApps()
    };

    userPermissionsAPI.canApplyProfiles = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canApplyProfiles') > -1;
        });
    };

    userPermissionsAPI.canApplyPartners = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canApplyPartners') > -1;
        });
    };

    userPermissionsAPI.canApplyUsers = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canApplyUsers') > -1;
        });
    };

    userPermissionsAPI.canEditApis = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('APIs Admin') > -1;
        });
    };

    userPermissionsAPI.canEditComponents = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('Components Admin') > -1;
        });
    };

    userPermissionsAPI.canEditPlatforms = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('Platforms Admin') > -1;
        });
    };

    userPermissionsAPI.canViewResources = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canViewResources') > -1;
        });
    };


    userPermissionsAPI.canViewEvents = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canViewEvents') > -1;
        });
    };

    userPermissionsAPI.canViewProfiles = function () {
        return userPermissionsAPI.canApplyProfiles().then(function (canApply) {
            if (canApply) {
                return true
            } else {
                return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
                    return permissions.indexOf('canViewProfiles') > -1;
                });
            }

        })
    };

    userPermissionsAPI.canViewUsers = function () {
        return userPermissionsAPI.canApplyUsers().then(function (canApply) {
            if (canApply) {
                return true
            } else {
                return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
                    return permissions.indexOf('canViewUsers') > -1;
                });
            }

        })
    };

    userPermissionsAPI.canViewPartners = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canViewPartners') > -1;
        });
    };

    userPermissionsAPI.canViewSockets = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canViewSockets') > -1;
        });
    };

    userPermissionsAPI.canViewCronJobs = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canViewCronJobs') > -1;
        });
    };

    userPermissionsAPI.canViewTechnologies = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canViewTechnologies') > -1;
        });
    };

    userPermissionsAPI.canManageTaskTypes = function () {
        return userPermissionsAPI.getPermissionsForApp('Dev Tool Belt').then(function (permissions) {
            return permissions.indexOf('canManageTaskTypes') > -1;
        });
    };

    userPermissionsAPI.canViewAllGroups = function () {
        return userPermissionsAPI.getPermissionsForApp('groups-api').then(function (permissions) {
            return permissions.indexOf('canViewAllGroups') > -1;
        });
    };

    return userPermissionsAPI;
}
