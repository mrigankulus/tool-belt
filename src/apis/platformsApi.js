appModule.factory('platformsAPI', makeplatformsAPI);

function makeplatformsAPI ($http, rootApiUrl, CacheFactory, wwtEnv) {
    var platformsAPI = {},
        baseURL = rootApiUrl + '/platforms',
        cacheKey = 'platformsCache',
        environmentsCacheKey = 'environmentsCache';

    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory(environmentsCacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    function clearPlatformsCache(response) {
        CacheFactory.get(cacheKey).removeAll();
        return response;
    }

    function clearEnvironmentsCache(response) {
        CacheFactory.get(environmentsCacheKey).removeAll();
        return response;
    }

    platformsAPI.getPlatforms = function () {
        return $http.get(baseURL, {cache: CacheFactory.get(cacheKey)});
    };

    platformsAPI.getPlatformById = function (id) {
        return $http.get(baseURL + '/' + id, {cache: true});
    };

    platformsAPI.createPlatform = function (newPlatform) {
        return $http.post(baseURL, newPlatform).then(clearPlatformsCache);
    };

    platformsAPI.deletePlatform = function (platformId) {
        return $http.delete(baseURL + '/' + platformId).then(clearPlatformsCache);
    };

    platformsAPI.updatePlatform = function (platform) {
        var cleanPlatform = {platformName: platform.platformName};

        return $http.put(baseURL + '/' + platform.id, cleanPlatform).then(clearPlatformsCache);
    };

    platformsAPI.getEnvironmentsForPlatform = function (id) {
        return $http.get(baseURL + '/' + id + '/environments', {cache: CacheFactory.get(environmentsCacheKey)});
    };

    platformsAPI.createEnvironment = function (platformId, newEnvironment) {
        return $http.post(baseURL + '/' + platformId + '/environments', newEnvironment).then(clearEnvironmentsCache);
    };

    platformsAPI.deleteEnvironment = function (platformId, environmentId) {
        return $http.delete(baseURL + '/' + platformId + '/environments/' + environmentId).then(clearEnvironmentsCache);
    };

    platformsAPI.updateEnvironment = function (platformId, environment) {
        var updatedEnvironment = {
          'baseUrl': environment.baseUrl,
          'proxyUrl': environment.proxyUrl,
          'environment': environment.environment
        };

        return $http.put(baseURL + '/' + platformId + '/environments/' + environment.id, updatedEnvironment).then(clearEnvironmentsCache);
    };

    return platformsAPI;
}
