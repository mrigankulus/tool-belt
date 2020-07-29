appModule.controller('ManageProfilesCtrl', makeManageProfilesCtrl);

function makeManageProfilesCtrl($scope, $q, appsAPI, $state, assetState, noDeleteProfiles, Group) {
    var vm = this;

    vm.linkProfileToRole = linkProfileToRole;
    vm.removeProfileFromRole = removeProfileFromRole;
    vm.disableDeleteProfile = disableDeleteProfile;
    vm.refreshProfileResults = refreshProfileResults;
    vm.onProfileSelect = onProfileSelect;
    vm.updateProfile = updateProfile;
    vm.getUsersCountForProfile = getUsersCountForProfile;

    vm.role = $scope.role;

    init();

    function init() {
        vm.role.isLoadingProfiles = true;

        appsAPI.getProfilesForRole($scope.ApplicationPermissions.appId, vm.role.id).then(function (response) {
            vm.role.isLoadingProfiles = false;

            vm.profiles = _.map(response.data, function (it) {
                var fullProfile = _.find($scope.ApplicationPermissions.allProfiles, {id: it.profile.id}) || {};

                return {
                    id: it.profile.id,
                    name: it.profile.name,
                    description: it.profile.description,
                    allInternalUsersFlag: fullProfile.allInternalUsersFlag
                };
            });

            if (_.size(vm.profiles)) {
                let requests = []
                vm.profiles.forEach(function (it) {
                    requests.push(Group.findById(`wwt-profile:${it.id}`))
                });
                $q.all(requests).then(responses => {
                    if (_.size(responses)) {
                        responses.map(response => {
                            let targetProfile = vm.profiles.find(profile => {
                                return _.get(profile, 'id', '').toString() === response.data.id.replace('wwt-profile:', '')
                            })

                            if (targetProfile) {
                                // just in case the titles are different, show the
                                // group title here to avoid confusion
                                targetProfile.title = response.data.title
                                targetProfile._callerRights = response.data._callerRights
                            }
                        })
                    }
                })
            }

            vm.profiles.forEach(function (it) {
                appsAPI.getUsersForProfile(it.id).then(function (usersResponse) {
                    it.users = usersResponse.data;
                });
            });
        });
    }

    function createProfileIfNeeded(profile) {
        if (profile.userEntered) {

            if (!profile.description) {
                profile.description = profile.name;
            }

            return appsAPI.createProfile(profile).then(function (response) {
                return response.data;
            });
        } else {
            return $q.when(profile);
        }
    }

    function linkProfileToRole(role, profile) {
        role.isSavingLinkedProfile = true;

        createProfileIfNeeded(profile).then(function (profileResponse) {
            var allInternalUsersFlag = profileResponse.allInternalUsersFlag;

            appsAPI.createProfileToRoleLink(profileResponse.id, role.id).then(function (response) {
                role.isLinkingProfile = false;
                role.isSavingLinkedProfile = false;

                if (!vm.profiles) {
                    vm.profiles = [];
                }

                profile.userEntered = false;

                if (!response.allInternalUsersFlag) {
                    response.allInternalUsersFlag = allInternalUsersFlag;
                }

                profile.isLinking = false;
                vm.profiles.push(response);
                $scope.ApplicationPermissions.allProfiles.push(response);
                role.newProfile = {};
            });

        });
    }

    function updateProfile(profile) {
        profile.isUpdating = true;

        appsAPI.updateProfile(profile).then(function () {
            profile.isUpdating = false;
            profile.isEditing = false;
        });
    }

    function removeProfileFromRole(role, profile) {
        appsAPI.removeProfileFromRole(profile.id, role.id).then(function (response) {
            _.remove(vm.profiles, {id: profile.id});
        });
    }

    function disableDeleteProfile(profile) {
        return noDeleteProfiles.getNoDeleteProfilesList(profile)
    }

    function refreshProfileResults($select) {
        var search = $select.search,
            list = angular.copy($select.items);

        //remove last user input
        _.remove(list, 'userEntered');

        if (!search || _.find($scope.ApplicationPermissions.allProfiles, {name: search})) {
            //use the predefined list if there is no search or the searched
            // name is already in use.
            $select.items = list;
        } else {
            //manually add user input and set selection
            var userInputItem = {
                userEntered: true,
                name: search
            };
            $select.items = [userInputItem].concat(list);
            $select.selected = userInputItem;
        }
    }

    function onProfileSelect(profile) {
        // need to track this in a separate property so it doesn't
        // change every time the model does. feels janky in the UI.
        if (!profile) {
            return;
        }

        profile.shouldShowNewProfileForm = profile.userEntered;
    }

    function getUsersCountForProfile(profile) {
        if (profile.allInternalUsersFlag === 'Y') {
            return 'ALL';
        }

        if (!profile.users) {
            return;
        }

        return _.filter(profile.users, function (it) {
            // This is a little funny looking, but we get an
            // object with a single empty property in some circumstances.
            return it;
        }).length;
    }
}
