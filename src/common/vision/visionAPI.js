appModule.factory('visionAPI', makeVisionAPI);

function makeVisionAPI($http, wwtEnv) {

    var visionAPI = {},
        baseURL = wwtEnv.getApiForwardUrl() + '/vision';

    visionAPI.getGroups = function () {
        return $http.get(baseURL + '/groups', {cache: true, willHandleErrors: true});
    };

    visionAPI.getIdeasForGroup = function (groupID) {
        return $http.get(baseURL + '/groups/' + groupID + '/ideas', {willHandleErrors: true});
    };

    visionAPI.getBoard = function (groupID) {
        return $http.get(baseURL + '/groups/' + groupID, {willHandleErrors: true});
    };


    visionAPI.getVisionLink = function (groupID) {
        var env = wwtEnv.getEnv();
        var targetPrefix = '';

        if (env === 'local' || env === 'dev') {
            targetPrefix = 'https://www-dev.wwt.com'
        } else if (env === 'tst' || env === 'test') {
            targetPrefix = 'https://www-test.wwt.com'
        } else {
            targetPrefix = 'https://www.wwt.com'
        }

        return targetPrefix + '/vision/#/group/' + groupID + '/ideas';
    };

    return visionAPI;
}
