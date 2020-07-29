appModule.factory('componentsAPI', makecomponentsAPI);

function makecomponentsAPI ($http, $q, CacheFactory, wwtEnv, rootApiUrl) {
    var componentsAPI = {},
        baseURL = rootApiUrl + '/components',
        cacheKey = 'componentsCache';

    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory('componentsForTechCache', {
        maxAge: 3000,
        deleteOnExpire: 'aggressive'
    });

    componentsAPI.getComponents = function () {
        return $http.get(baseURL, {cache: CacheFactory.get(cacheKey)});
    };

    componentsAPI.findForTechnology = function (technologyId) {
        return $http.get(baseURL + '?technologyId=' + technologyId, {cache: CacheFactory.get('componentsForTechCache')});
    };

    componentsAPI.getComponentById = function (componentId) {
        return $http.get(baseURL + '/' + componentId);
    };

    componentsAPI.getVersionsByComponentId = function (componentId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/cdn/packages/artifactory/' + componentId + '/versions', {willHandleErrors: true});
    };

    componentsAPI.update = function (component) {
        var cleanComponent = _.clone(component);

        delete cleanComponent.who;
        delete cleanComponent.isLoading;
        delete cleanComponent.packageJson;

        return $http.put(baseURL + '/' + cleanComponent.id, cleanComponent).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    componentsAPI.create = function (component) {
        return $http.post(baseURL, component).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    componentsAPI.delete = function (component) {
        return $http.delete(baseURL + '/' + component.id).then(function (response) {
            CacheFactory.get(cacheKey).removeAll();
            return response;
        });
    };

    return componentsAPI;
}
