appModule.factory('registrationAPI', makeRegistrationAPI);

function makeRegistrationAPI($http, wwtEnv) {
    const apiUrl = wwtEnv.getApiForwardUrl() + '/registration'

    const generatePin = function(userName, action) {
        const data = {
            userName,
            action: action || 'setup'
        }

        return $http.post(`${apiUrl}/pin`, data)
    }

    return {
        generatePin
    }
}
