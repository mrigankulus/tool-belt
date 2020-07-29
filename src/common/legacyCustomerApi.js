appModule.factory('legacyCustomerApi', makelegacyCustomerApi)

function makelegacyCustomerApi(wwtEnv, $http, amqpEventsAPI) {
    var api = {}

    api.getForProfileId = function (profileId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileId + '/customers').then(function (response) {
            // remove nulls
            _.remove(response.data, function (it) {
                return !it
            })

            return response
        })
    }

    api.search = function (str) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/ph1-customer/getTypeAhead?searchString=' + str)
    }

    api.addCustomerToProfile = function (profile, customer) {
        return $http.post(wwtEnv.getApiForwardUrl() + '/profiles/' + profile.id + '/customers', {id: customer.id}).then(function (response) {
            var message = _.cloneDeep(profile)
            message.customer = _.cloneDeep(customer)

            return amqpEventsAPI.sendEvent('wwt.userSecurityProfile.legacyCustomerAddedToProfile', '#', message, 'addActor').then(function () {
                return response
            })
        })
    }

    api.removeCustomerFromProfile = function (association) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/profiles/' + association.profile.id + '/customers/' + association.customer.id).then(function (response) {
            var message = _.cloneDeep(association.profile)
            message.customer = _.cloneDeep(association.customer)

            return amqpEventsAPI.sendEvent('wwt.userSecurityProfile.legacyCustomerRemovedFromProfile', '#', message, 'addActor').then(function () {
                return response
            })
        })
    }

    return api
}