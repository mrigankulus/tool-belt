appModule.controller('UserTypeaheadCtrl', makeUserTypeaheadCtrl);

function makeUserTypeaheadCtrl($scope, usersAPI) {
    var vm = this;

    vm.searchUsers = searchUsers;
    vm.onSelectUser = onSelectUser;

    function searchUsers(searchText) {
        if (searchText && searchText.length > 1) {
            usersAPI.findUserBySearchTerm(searchText).then(function (response) {
                vm.availableUsers = response.data;
            });
        } else {
            vm.availableUsers = [];
        }
    }

    function onSelectUser(user) {
        if ($scope.onSelectUser && user && user.userName) {
            $scope.onSelectUser(user);
        }
    }
}