appModule.controller('UsersForProfileCtrl', makeUsersForProfileCtrl);

function makeUsersForProfileCtrl($scope, appsAPI, assetState, $timeout, Group) {
    var vm = this;

    vm.profile = $scope.ApplicationPermissions.activeProfile;
    vm.limitStart = 30;
    vm.limit = vm.limitStart;
    vm.increaseLimit = increaseLimit;
    vm.addUserToProfile = addUserToProfile;
    vm.removeUserFromProfile = removeUserFromProfile;
    vm.activeTab = 'memberList';

    init();

    function init() {
        if (!vm.profile) {
            return;
        }

        if (!vm.profile.users) {
            vm.profile.users = [];
        }

        loadWriteAccessGroups()
    }

    function increaseLimit() {
        vm.limit += vm.limitStart;
    }

    function addUserToProfile(user) {
        var formattedUser = {
            ldapUserId: user.userName,
            userName: user.fullName,
            id: user.id || user.wwtUserId
        };

        formattedUser.isProcessing = true;
        vm.isAddingUser = user;
        vm.successfullyAddedUser = false;

        vm.profile.users.push(formattedUser);

        appsAPI.linkUserToProfile(vm.profile, formattedUser, assetState.currentAsset.id).then(function (response) {
            formattedUser.isProcessing = false;
            vm.isAddingUser = false;
            vm.successfullyAddedUser = user;

            $timeout(function () {
                vm.successfullyAddedUser = false;
            }, 1000);
        });
    }

    function removeUserFromProfile(user) {
        user.isProcessing = true;

        appsAPI.removeUserFromProfile(vm.profile, user, assetState.currentAsset.id).then(function (response) {
            _.remove(vm.profile.users, {id: user.id});
        });
    }

    function loadWriteAccessGroups() {
        if (!vm.profile) return
        let writeGroupIds = []
        vm.writeAccessGroups = []

        Group.findById(`wwt-profile:${vm.profile.id}`).then(function (response) {
            let group = response.data
            if (!group || !_.size(group.types)) return

            group.types.forEach(type => {
                if (_.size(_.get(type, 'writeGroups'))) {
                    writeGroupIds = writeGroupIds.concat(type.writeGroups)
                }
            })

            writeGroupIds = _.uniq(writeGroupIds)
            Group.find({ids: writeGroupIds.join(','), select: 'title'}).then(function (groupsResponse) {
                vm.writeAccessGroups = _.get(groupsResponse.data, 'docs', [])
            })
        })
    }
}