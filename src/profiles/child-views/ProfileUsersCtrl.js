appModule.controller('ProfileUsersCtrl', makeProfileUsersCtrl);

function makeProfileUsersCtrl(appsAPI, $scope, $stateParams, $timeout) {
    var vm = this;

    vm.usersLimitStart = 24;
    vm.usersLimit = vm.usersLimitStart;
    vm.shouldShowBlankSlate = shouldShowBlankSlate;
    vm.addUserToProfile = addUserToProfile;
    vm.onSelectUserFromTypeAhead = onSelectUserFromTypeAhead;
    vm.removeUser = removeUser;
    vm.getShouldDisableUserSelectionReason = getShouldDisableUserSelectionReason;

    init();

    function init() {
        vm.isLoadingUsers = true;
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        appsAPI.getUsersForProfile($stateParams.profileId).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.users = response.data;

            _.remove(vm.users, function (it) {
                return !it
            });

            vm.isLoadingUsers = false;
        });
    }

    function shouldShowBlankSlate() {
        return !vm.isLoadingUsers && (!vm.users || !vm.users.length);
    }

    function addUserToProfile() {
        vm.isSavingUser = true;

        var formattedUser = {
            ldapUserId: vm.newUser.userName,
            userName: vm.newUser.fullName,
            id: vm.newUser.id || vm.newUser.wwtUserId
        };

        appsAPI.linkUserToProfile($scope.ProfileDetail.profile, formattedUser).then(function (response) {
            vm.isSavingUser = false;
            vm.users.push(response.data);
            vm.newUser = '';
            vm.isAddingUser = false;
        });
    }

    function onSelectUserFromTypeAhead(user) {
        vm.newUser = user;
    }

    function removeUser(user) {
        user.isProcessing = true;

        appsAPI.removeUserFromProfile($scope.ProfileDetail.profile, user).then(function (response) {
            _.remove(vm.users, {id: user.id});
        });
    }

    function getShouldDisableUserSelectionReason(user) {
        if (!user) {
            return;
        }

        if (_.find(vm.users, {id: user.id})) {
            return '(' + $scope.ProfileDetail.profile.name + ' already has this user.)';
        }
    }
}
