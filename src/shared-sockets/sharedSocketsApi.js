appModule.factory('sharedSocketsApi', makesharedSocketsApi);

function makesharedSocketsApi($http, wwtEnv, wwtNgSocketsSettings) {
    var api = {};

    api.getSharedSockets = function () {
        return $http.get(wwtNgSocketsSettings.settings.apiUrl, {willHandleErrors: true});
    };

    return api;
}