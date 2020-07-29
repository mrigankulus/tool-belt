appModule.controller('ServiceUserTypeaheadCtrl', makeServiceUserTypeaheadCtrl)

function makeServiceUserTypeaheadCtrl($scope, usersAPI) {
    const vm = this

    vm.searchUsers = searchUsers
    vm.onSelectUser = onSelectUser

    function searchUsers(searchText) {
        // require at least 3 characters in search term
        if (searchText.length < 3) {
            return
        }

        // match the first instance of svc or svc_ and replace it with an empty string
        let term = searchText.replace(/svc_?/i, '')
        let search = `svc_${term}`

        if (searchText && searchText.length > 1) {
            usersAPI.findUserBySearchTerm(search).then(function (response) {
                // even though we restrict searches to start with svc_,
                // we still only want users where the type='svc'
                vm.availableUsers = response.data.filter(it => it.type === 'svc')
            })
        } else {
            vm.availableUsers = []
        }
    }

    function onSelectUser(user) {
        if ($scope.onSelectUser && user && user.userName) {
            $scope.onSelectUser(user)
        }
    }
}
