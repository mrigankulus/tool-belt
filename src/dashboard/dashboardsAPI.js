appModule.factory('dashboardsAPI', makeDashboardsAPI);

function makeDashboardsAPI($http, $timeout, CacheFactory, wwtUser, wwtEnv, rootApiUrl) {
    var dashboardsAPI = {},
        baseURL = rootApiUrl + '/dashboards',
        cacheKey = 'dashboardsCache';

    CacheFactory(cacheKey, {
        maxAge: 10 * 1000,

        // a short value here (1 second) seems to work well. We're saying that the data
        // is old after 1 second. So show the old data and update and cache it
        // for the next call.
        cacheFlushInterval: 1 * 1000,
        deleteOnExpire: 'aggressive'

    });

    function clearCache(response) {
        CacheFactory.get(cacheKey).removeAll();
        return response;
    }

    dashboardsAPI.clearCache = clearCache;

    dashboardsAPI.getDashboardByUserName = function (userName) {
        return $http.get(baseURL + '/' + userName, {cache: CacheFactory.get(cacheKey)});
    };

    var createTimer;

    dashboardsAPI.create = function (dashboard) {
        // allows us to call this several times, but be sure to only create one.
        $timeout.cancel(createTimer);

        createTimer = $timeout(function () {
            return $http.post(baseURL, dashboard).then(clearCache);
        }, 200);

        return createTimer;
    };

    function cleanDashboardBeforeSaving(dashboard) {
        // We don't want to save everything...the api won't like everything,
        // and the data will start to get messy.

        dashboard.items.forEach(function (item) {
            if (item.data && item.data.connectedJenkinsJobs) {
                item.data.connectedJenkinsJobs.forEach(function (job) {
                    delete job.lastJobData;
                });
            }

            if (item.data && item.data.packageJson) {
                delete item.data.packageJson;
            }

            if (item.tempData) {
                delete item.tempData;
            }

            // we saw a situation where this sucker made it back into the
            // user's widgets. this should ensure that it isn't saved.
            _.remove(dashboard.items, function (item) {
                return item.type === 'githubActivity';
            });
        });

        return dashboard;
    }

    dashboardsAPI.update = function (dashboard) {
        var cleanDashboard = _.cloneDeep(dashboard);
        cleanDashboard = cleanDashboardBeforeSaving(cleanDashboard);

        return $http.put(baseURL + '/' + cleanDashboard.id, cleanDashboard).then(clearCache);
    };

    return dashboardsAPI;
}