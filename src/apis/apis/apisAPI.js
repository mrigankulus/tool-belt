appModule.factory('apisAPI', makeApisAPI);

function makeApisAPI($http, $q, rootApiUrl, CacheFactory, wwtUser, wwtEnv) {
    var apisAPI = {},
        baseURL = rootApiUrl + '/apis',
        cacheKey = 'apisCache',
        overridesCacheKey = 'apiOverridesCache',
        allOverridesCacheKey = 'allOverridesCache';

    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    // we don't want to be caching these for long!
    // we just want to prevent superfluous requests.
    CacheFactory(overridesCacheKey, {
        maxAge: 1 * 1000,
        cacheFlushInterval: 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory(allOverridesCacheKey, {
        maxAge: 1 * 1000,
        cacheFlushInterval: 1000,
        deleteOnExpire: 'aggressive'
    });

    apisAPI.getApis = function () {
        return $http.get(baseURL, { cache: CacheFactory.get(cacheKey) });
    };

    apisAPI.getLatestApis = function () {
        var url = wwtEnv.getApiForwardUrl() + '/api-routes'
        return $http.get(url + '?latest=true', { cache: CacheFactory.get(cacheKey) })
    };

    apisAPI.getApisForApplication = function (application) {
        return $http.get(baseURL, { cache: CacheFactory.get(cacheKey) }).then(function (response) {
            response.data = _.filter(response.data, function (api) {
                return api.routePrefix === application.appName
            })

            return response
        })
    };

    apisAPI.getRecentActivity = function (ignoredApis) {
        if (!ignoredApis) {
            ignoredApis = [];
        }

        ignoredApis = ignoredApis.join();

        var url = wwtEnv.getApiForwardUrl() + '/api-logs/log-events'
        url += '?ignoredApis=' + ignoredApis

        return $http.get(url, { willHandleErrors: true });
    };

    apisAPI.getApiById = function (apiId) {
        return $http.get(baseURL + '/' + apiId);
    };

    apisAPI.getStatsForApi = function (apiId) {
        var url = wwtEnv.getApiForwardUrl() + '/api-logs/log-events'
        url += '?apiIds=' + apiId + '&count=700'
        return $http.get(url, { willHandleErrors: true });
    };

    apisAPI.update = function (api) {
        api.id = api.id.toString();
        delete api.who;
        return $http.put(baseURL + '/' + api.id, api).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    apisAPI.create = function (api) {
        return $http.post(baseURL, api).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    apisAPI.getApiByName = function (apiName) {
        var url = wwtEnv.getApiForwardUrl() + '/api-routes'
        return $http.get(url + '?apiName=' + apiName, { willHandleErrors: true });
    };

    apisAPI.getAvailablePlatforms = function () {
        return $http.get(rootApiUrl + '/platforms');
    };

    apisAPI.deleteApi = function (api) {
        return $http.delete(baseURL + '/' + api.id, api).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    apisAPI.getAllOverrides = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/api-route-overrides', { willHandleErrors: true, cache: CacheFactory.get(allOverridesCacheKey) })
    };

    apisAPI.getOverridesForUser = function (user) {
        if (!user) {
            return wwtUser.getCurrentUser().then(function (response) {
                return $http.get(rootApiUrl + '/api-overrides?userId=' + response.data.wwtUserId, { willHandleErrors: true, cache: CacheFactory.get(overridesCacheKey) });
            });
        }

        return $http.get(rootApiUrl + '/api-overrides?userId=' + user.wwtUserId, { willHandleErrors: true, cache: CacheFactory.get(overridesCacheKey) });
    };

    apisAPI.getOverridesForApi = function (apiId) {
        return $http.get(baseURL + '/' + apiId + '/routing-overrides', { willHandleErrors: true });
    };

    apisAPI.getOverridesForApiAndUser = function (apiId, userId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/api-route-overrides?wwtUserId=' + userId + '&apiId=' + apiId, { willHandleErrors: true, cache: CacheFactory.get(allOverridesCacheKey) });
    };

    apisAPI.updateOverride = function (override) {
        delete override.isEditing
        delete override.isUpdating
        return $http.put(baseURL + '/' + override.apiId + '/routing-overrides/' + override.id, override);
    };

    apisAPI.deleteOverride = function (override) {
        return $http.delete(baseURL + '/' + override.apiId + '/routing-overrides/' + override.id, override);
    };

    apisAPI.getApiReport = function (apiId) {
        return $http.get(wwtEnv.getApiRouterUrl() + '/endpoint-security-reports', {
            params: {
                'route.id': apiId
            }
        }).then(function (response) {
            if (!response.data) {
                return []
            }
            return response.data
        })
    }

    apisAPI.getApiExceptions = function (apiID) {
        return $http.get(wwtEnv.getApiRouterUrl() + '/endpoint-security-request-exceptions', {
            params: {
                apiId: apiID
            }
        }).then(function (response) {
            if (!response.data) {
                return []
            }
            return response.data
        })
    }

    apisAPI.reRunApiReport = function (apiID) {
        return $http.post(wwtEnv.getApiRouterUrl() + '/endpoint-security-reports/' + apiID).then(function (response) {
            if (!response.data) {
                return {}
            }
            return response
        })
    }

    apisAPI.updateException = function (id, body) {
        return $http.put(wwtEnv.getApiRouterUrl() + '/endpoint-security-request-exceptions/' + body.id, body).then(function (response) {
            if (!response.data) {
                return {}
            }
            return response
        })
    }

    apisAPI.createException = function (body) {
        return $http.post(wwtEnv.getApiRouterUrl() + '/endpoint-security-request-exceptions', body).then(function (response) {
            if (!response.data) {
                return {}
            }
            return response
        })
    }

    apisAPI.createImportExceptions = function (body) {
        return $http.post(wwtEnv.getApiRouterUrl() + '/endpoint-security-request-exceptions', body, { willHandleErrors: true }).then(function (response) {
            if (!response.data) {
                return {}
            }
            return response
        })
    }

    apisAPI.deleteException = function (exceptionId) {
        return $http.delete(wwtEnv.getApiRouterUrl() + '/endpoint-security-request-exceptions/' + exceptionId).then(function (response) {
            if (!response.data) {
                return {}
            }
            return response
        })
    }

    return apisAPI;
}
