appModule.factory('cronJobsApi', makecronJobsApi);

function makecronJobsApi($http, wwtEnv, CacheFactory) {
    var cronJobsApi = {},
        cacheKey = 'cronJobsCache';


    CacheFactory(cacheKey, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    function clearCache(response) {
        CacheFactory.get(cacheKey).removeAll();
        return response;
    }

    cronJobsApi.getJobs = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/crontriggers/triggers?max=300', {cache: CacheFactory.get(cacheKey)});
    };

    cronJobsApi.getJob = function (id) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/crontriggers/triggers/' + id);
    };

    cronJobsApi.updateJob = function (job) {
        var cleanJob = _.cloneDeep(job);

        delete cleanJob.id;

        return $http.put(wwtEnv.getApiForwardUrl() + '/crontriggers/triggers/' + job.id + '?force=true', cleanJob).then(clearCache);
    };

    cronJobsApi.deleteJob = function (jobId) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/crontriggers/triggers/' + jobId + '?force=true').then(clearCache);
    };

    return cronJobsApi;
}