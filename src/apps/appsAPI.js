appModule.factory('appsAPI', makeAppsAPI);

function makeAppsAPI($http, CacheFactory, wwtEnv, rootApiUrl, $q, amqpEventsAPI, $state, assetState, profileEvents, messenger, noDeleteProfiles) {

    var appsAPI = {},
        appsBaseUrl = rootApiUrl + '/applications',
        appsServiceUrl = wwtEnv.getApiForwardUrl() + '/applications',
        cacheKey = 'appsCache',
        profilescacheKey = 'profilesCache';

    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory(profilescacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    function clearProfileCache(response) {
        CacheFactory.get(profilescacheKey).removeAll();
        return response;
    }

    function isAppOrApi() {
        return $state.includes('apiDetail') ? 'api' : 'application';
    }

    appsAPI.getAppLink = function () {
        var app = assetState.currentAsset;

        if (app.fixedUrlFlag === 'N') {
            var currentEnv = wwtEnv.getEnv(),
                url = 'https://www-dev.wwt.com';

            if (currentEnv === 'prd') {
                url = 'https://www.wwt.com'
            } else if (currentEnv === 'tst') {
                url = 'https://www-test.wwt.com'
            }

            return url + '/' + app.appLocation;

        } else {
            return 'http://' + app.appLocation;
        }
    };

    appsAPI.getApps = function (includeApiMasks) {
        var url = appsBaseUrl

        if (includeApiMasks) {
            url += '?includeApiMasks=true'
        }

        return $http.get(url, {cache: CacheFactory.get(cacheKey)});
    };

    appsAPI.getAppsForUserId = function (wwtUserId) {
        return $http.get(appsServiceUrl + '?userId=' + wwtUserId);
    };

    appsAPI.getAppById = function (appId) {
        return $http.get(appsBaseUrl + '/' + appId);
    };

    appsAPI.getAppAnalytics = function (appId, bustCache) {
        return $http.get(appsBaseUrl + '/' + appId + '/analytics', {
            cache: !bustCache,
            headers: {
                ignoreErrors: true
            }
        });
    };

    appsAPI.getAppAnalyticsReport = function (appId, reportTypeId, bustCache) {
        return $http.get(appsBaseUrl + '/' + appId + '/analytics/' + reportTypeId, {
            cache: !bustCache,
            headers: {
                ignoreErrors: true
            }
        });
    };

    appsAPI.linkGAProfile = function (appId, profile) {
        return $http.put(appsBaseUrl + '/' + appId + '/analytics', profile);
    };

    appsAPI.createApplication = function (app) {
        return $http.post(appsBaseUrl, app).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    appsAPI.update = function (app) {
        app.id = app.id.toString();
        delete app.who;
        return $http.put(appsBaseUrl + '/' + app.id, app).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    appsAPI.deleteApplication = function (appId) {
        return $http.delete(appsBaseUrl + '/' + appId).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    appsAPI.getRolesForApp = function (appId) {
        return $http.get(appsServiceUrl + '/' + appId + '/roles');
    };

    appsAPI.getRolesForProfile = function (profileId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/roles');
    };

    appsAPI.getPermissionsForRole = function (appId, roleId) {
        return $http.get(appsServiceUrl + '/' + appId + '/roles/' + roleId + '/permissions');
    };

    appsAPI.getProfilesForRole = function (appId, roleId) {
        return $http.get(appsServiceUrl + '/' + appId + '/roles/' + roleId + '/profiles');
    };

    appsAPI.getProfileById = function (profileId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId);
    };

    appsAPI.getAllProfiles = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles', {cache: CacheFactory.get(profilescacheKey)});
    };

    appsAPI.getProfilesForUser = function (wwtUserId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles?userId=' + wwtUserId).then(function (response) {
            if (response.data && response.data.length) {
                if (!response.data[0]) {
                    response.data = [];
                    return response;
                }
            }

            return response;
        })
    };

    appsAPI.createProfile = function (profile, resourceId) {
        return $http.post(wwtEnv.getApiForwardUrl() + '/profiles', profile).then(function (response) {
            clearProfileCache(response);
            return response
        });
    };

    appsAPI.getUsersForProfile = function (profileId) {
        if (!profileId) {
            return $q.reject('No ID Provided')
        }
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/users', {
            willHandleErrors: true
        });
    };

    appsAPI.linkUserToProfile = function (profile, user, appId) {
        return $http.post(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id + '/users', user)
    };

    appsAPI.removeUserFromProfile = function (profile, user, appId) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id + '/users/' + user.id)
    };

    appsAPI.createProfileToRoleLink = function (profileId, roleId) {
        return $http.post(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/roles', {"id": roleId}).then(function (response) {
            var newProfile = response.data.profile;

            return appsAPI.getUsersForProfile(newProfile.id).then(function (response) {
                newProfile.users = response.data;
                return newProfile;
            });
        });
    };

    appsAPI.removeProfileFromRole = function (profileId, roleId) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/roles/' + roleId);
    };

    appsAPI.updateProfile = function (profile) {
        return $http.put(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id, profile).then(clearProfileCache);
    };

    appsAPI.deleteProfile = function (profile, resourceId) {
        if (noDeleteProfiles.getNoDeleteProfilesList(profile)) {

            messenger.showMessage({
                "type": "error validation-failed",
                "title": "Cannot delete this profile",
                "content": "Sorry, this specific profile cannot be deleted.",
                "isDismissable": false,
                customActions: [
                    {
                        title: 'Cancel',
                        mood: 'cancel',
                        actionFunction: function () {
                            messenger.dismissMessage();
                        }
                    }
                ]
            });

            return $q.reject('Cannot delete this profile')
        }

        return $http.delete(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id).then(function (response) {
            clearProfileCache(response);
            return response
        });
    };

    appsAPI.getPermissionsForApp = function (appId) {
        return $http.get(appsServiceUrl + '/' + appId + '/permissions');
    };

    appsAPI.createRoleForApp = function (appId, newRole) {
        return $http.post(appsServiceUrl + '/' + appId + '/roles', newRole).then(function (response) {
            var message = {};
            message.roleName = response.data.name;
            message.id = assetState.currentAsset.id.toString();

            return amqpEventsAPI.sendEvent('wwt.' + isAppOrApi() + '.roleCreated', '#', message, 'addActor').then(function () {
                return response;
            });
        });
    };

    appsAPI.getPermittedUsersForApp = function (appId) {
        return $http.get(appsServiceUrl + '/' + appId + '/users');
    };

    appsAPI.getPermittedCustomersForApp = function (appId) {
        return $http.get(appsServiceUrl + '/' + appId + '/customers');
    };

    appsAPI.createPermissionForApp = function (appId, permission) {
        return $http.post(appsServiceUrl + '/' + appId + '/permissions', permission).then(function (response) {
            var message = {};
            message.permissionName = response.data.name;
            message.id = assetState.currentAsset.id.toString();

            return amqpEventsAPI.sendEvent('wwt.' + isAppOrApi() + '.permissionCreated', '#', message, 'addActor').then(function () {
                return response;
            });
        });
    };

    appsAPI.createPermissionAssociationForRole = function (appId, role, permission) {
        return $http.post(appsServiceUrl + '/' + appId + '/roles/' + role.id + '/permissions', permission);
    };

    appsAPI.updateRole = function (appId, role) {
        return $http.put(appsServiceUrl + '/' + appId + '/roles/' + role.id, role);
    };

    appsAPI.deleteRole = function (appId, role) {
        return $http.delete(appsServiceUrl + '/' + appId + '/roles/' + role.id);
    };

    appsAPI.updatePermission = function (appId, permission) {
        return $http.put(appsServiceUrl + '/' + appId + '/permissions/' + permission.id, permission);
    };

    appsAPI.deletePermissionAssociation = function (appId, role, permission) {
        return $http.delete(appsServiceUrl + '/' + appId + '/roles/' + role.id + '/permissions/' + permission.id);
    };

    appsAPI.deletePermission = function (appId, permission) {
        return $http.delete(appsServiceUrl + '/' + appId + '/permissions/' + permission.id);
    };

    return appsAPI;
}
