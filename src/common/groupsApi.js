appModule.factory('groupsApi', groupsApiFactory)

function groupsApiFactory($http, wwtEnv) {
    var groupsApi = {}

    groupsApi.getGroups = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/groups', {cache: true})
    }

    return groupsApi
}