appModule.factory('userApprovalsApi', userApprovalsApiFactory)

function userApprovalsApiFactory($http, wwtEnv, CacheFactory, amqpEventsAPI) {
    var userApprovalsApi = {}
    var userApprovalRolesCacheKey = 'userApprovalRolesCache'

    CacheFactory(userApprovalRolesCacheKey, {
        maxAge: 1000,
        cacheFlushInterval: 1000,
        deleteOnExpire: 'aggressive'
    })

    userApprovalsApi.getAllUserApprovalRoles = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/user-approval-roles', {cache: CacheFactory.get(userApprovalRolesCacheKey)})
    }

    userApprovalsApi.getUserApprovalRolesForProfileId = function (profileId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/user-approval-roles').then(function (response) {
            // clear nulls
            _.remove(response.data, function (it) {
                return !it
            })

            return response
        })
    }

    userApprovalsApi.addUserApprovalRoleToProfile = function (profile, userApprovalRole) {
        return $http.post(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id + '/user-approval-roles', userApprovalRole).then(function (response) {
            var message = _.cloneDeep(profile)
            message.role = userApprovalRole

            return amqpEventsAPI.sendEvent('wwt.userSecurityProfile.userApprovalRoleAddedToProfile', '#', message, 'addActor').then(function () {
                return response;
            });
        })
    }

    userApprovalsApi.removeUserApprovalRoleFromProfile = function (profile, association) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/profiles/' + association.profile + '/user-approval-roles/' + association.id).then(function (response) {
            var message = _.cloneDeep(profile)
            message.role = association

            return amqpEventsAPI.sendEvent('wwt.userSecurityProfile.userApprovalRoleRemovedFromProfile', '#', message, 'addActor').then(function () {
                return response;
            });
        })
    }


    return userApprovalsApi
}