appModule.factory('jenkinsAPI', makejenkinsAPI);

function makejenkinsAPI($q, $http, CacheFactory, wwtEnv, rootApiUrl) {
    var jenkinsAPI = {},
        baseUrl = rootApiUrl + '/jenkins-proxy',
        cacheKey = 'jenkinsCache';

    CacheFactory(cacheKey, {
        // 3 minutes
        maxAge: 3 * 60 * 1000,

        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive',

        // will store until browser is closed and reopened
        storageMode: 'sessionStorage'
    });

    jenkinsAPI.getJobAndLastBuild = function (orgName, jobName) {
        return $http.get(baseUrl + '/' + orgName + '/' + jobName, {cache: CacheFactory.get(cacheKey)});
    };

    jenkinsAPI.getJobActivity = function (orgName, jobName) {
        return $http.get(baseUrl + '/' + orgName + '/' + jobName + '/activity', {cache: true});
    };

    return jenkinsAPI;
}
