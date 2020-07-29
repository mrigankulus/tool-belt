appModule.factory('googleAnalyticsAPI', makegoogleAnalyticsAPI);

function makegoogleAnalyticsAPI($http, $q, assetState, wwtEnv, rootApiUrl) {
    var api = {};

    var baseUrl = wwtEnv.getApiForwardUrl() + '/google-analytics';

    api.getProfiles = function () {
        return $http.get(baseUrl + '/profiles/', {cache: true, willHandleErrors: true});
    };

    api.getReportsForProfile = function (profileId) {
        return $http.get(baseUrl + '/profiles/' + profileId + '/reports', {cache: true});
    };

    api.getMainDashboardReport = function () {
        var httpSettings = {
            cache: true,
            headers: {'ignoreErrors': true}
        };

        return $http.get(rootApiUrl + '/api-settings/google-analytics-dashboard-report', httpSettings).then(function (response) {
            var profile = response.data.value;

            if (!profile) {
                $q.reject(response);
            }

            return $http.get(baseUrl + '/profiles/' + profile.gaProfileId + '/reports/' + profile.reportId, httpSettings);
        });

    };

    api.getReportById = function (profileId, reportId) {
        var reportStartDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        var today = moment().format('YYYY-MM-DD');

        var urlParams = '?startDate=' + reportStartDate + '&endDate=' + today;

        return $http.get(baseUrl + '/profiles/' + profileId + '/reports/' + reportId + urlParams, {cache: true});
    };

    api.deleteReport = function (profileId, reportId) {
        return $http.delete(baseUrl + '/profiles/' + profileId + '/reports/' + reportId);
    };

    return api;
}
