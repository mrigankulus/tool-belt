appModule.factory('technologiesApi', technologiesApiFactory)

function technologiesApiFactory($http, $q, CacheFactory, wwtEnv, rootApiUrl) {
    var technologiesApi = {},
        baseURL = rootApiUrl + '/technologies',
        cacheKey = 'technologiesCache';

    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    technologiesApi.get = function () {
        return $http.get(baseURL, {cache: CacheFactory.get(cacheKey)});
    };

    technologiesApi.getById = function (id) {
        return $http.get(baseURL + '/' + id);
    };

    technologiesApi.update = function (component) {
        var cleanComponent = _.clone(component);

        delete cleanComponent.who;
        delete cleanComponent.isLoading;
        delete cleanComponent.packageJson;

        return $http.put(baseURL + '/' + cleanComponent.id, cleanComponent).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    technologiesApi.create = function (component) {
        return $http.post(baseURL, component).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    technologiesApi.delete = function (component) {
        return $http.delete(baseURL + '/' + component.id).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    return technologiesApi
}