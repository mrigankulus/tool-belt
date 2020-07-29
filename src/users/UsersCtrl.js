appModule.controller('UsersCtrl', makeUsersCtrl);

function makeUsersCtrl(usersAPI, userPermissionsAPI, recentlyViewed) {
    var vm = this;

    vm.searchUsers = searchUsers;
    vm.shouldShowRecentUsersText = shouldShowRecentUsersText;
    vm.showAddUserForm = showAddUserForm;
    vm.onCancelNewUser = onCancelNewUser;

    init();

    function init() {
        userPermissionsAPI.canViewUsers().then(function (response) {
            vm.canViewUsers = response;

            if (!vm.canViewUsers) {
                return;
            }

            if (!vm.usersSearchText) {
                loadRecentUsers();
            }
        });

        userPermissionsAPI.isDeveloper().then(function(response) {
            vm.isDeveloper = response;
        });
    }

    function loadRecentUsers() {
        recentlyViewed.get('users').then(function (recentResponse) {
            if (!recentResponse.data && !recentResponse.data.length) {
                return
            }

            var userIds = recentResponse.data.map(function (it) {
                return it.userName
            })

            usersAPI.getUsersByIds(userIds.join()).then(function (response) {
                vm.users = _.uniq(recentlyViewed.hydrateRecentListFromHydratedList('users', recentResponse.data, response.data))
            })

        })
    }

    function searchUsers() {
        if (!vm.usersSearchText) {
            loadRecentUsers();
            return;
        }

        vm.isSearching = true;

        usersAPI.findUserBySearchTerm(vm.usersSearchText).then(function (response) {
            vm.users = response.data;
            vm.isSearching = false;
        });
    }

    function shouldShowRecentUsersText() {
        return !vm.usersSearchText && vm.users && vm.users.length;
    }

    function showAddUserForm() {
        vm.isAddingUser = true;
    }

    function onCancelNewUser() {
        vm.isAddingUser = false;
    }
}
