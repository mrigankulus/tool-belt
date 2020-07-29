appModule.factory('reportRolesApi', reportRolesApiFactory)

function reportRolesApiFactory($http, wwtEnv, amqpEventsAPI) {
    var reportRolesApi = {}

    reportRolesApi.getAllReportRoles = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/report-roles', {cache: true})
    }

    reportRolesApi.addReportRoleToProfile = function (profile, reportRole) {
        return $http.post(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id + '/report-roles', reportRole).then(function (response) {
            var message = _.cloneDeep(profile)
            message.role = reportRole

            return amqpEventsAPI.sendEvent('wwt.userSecurityProfile.reportRoleAddedToProfile', '#', message, 'addActor').then(function () {
                return response
            })
        })
    }

    reportRolesApi.getRolesForProfileId = function (profileId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/report-roles').then(function (response) {
            // remove nulls
            _.remove(response.data, function (it) {
                return !it
            })

            return response
        })
    }

    reportRolesApi.removeRoleFromProfile = function (profile, roleAssocation) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/profiles/' + roleAssocation.profile + '/report-roles/' + roleAssocation.id).then(function (response) {
            var message = _.cloneDeep(profile)
            message.roleName = roleAssocation.reportRoleName

            return amqpEventsAPI.sendEvent('wwt.userSecurityProfile.reportRoleRemovedFromProfile', '#', message, 'addActor').then(function () {
                return response
            })
        })
    }

    return reportRolesApi
}