appModule.factory('keywordsAPI', makeKeywordsAPI);

function makeKeywordsAPI($http, CacheFactory, wwtEnv, rootApiUrl) {

    var keywordsAPI = {},
        keywordsBaseUrl = rootApiUrl + '/keywords',
        keywordsServiceUrl = wwtEnv.getApiForwardUrl() + '/keywords',
        cacheKey = 'keywordsCache';

    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 20 * 1000,
        deleteOnExpire: 'aggressive'
    });

    keywordsAPI.getApiKeywords = function() {
        return $http.get(keywordsServiceUrl + '/api', { cache: CacheFactory.get(cacheKey)});
    }

    return keywordsAPI;
}
