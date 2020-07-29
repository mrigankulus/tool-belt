appModule.controller('PartnerProfilesUsersCtrl', makePartnerProfilesUsersCtrl);

function makePartnerProfilesUsersCtrl(partnersAPI, userPermissionsAPI, appsAPI, usersAPI, registrationAPI, $state, $scope, $timeout, $q, partnerProfileUserMapper, messenger, userEvents, wwtFocusPanelSVC) {
    var vm = this;

    vm.addProfileToPartner = addProfileToPartner;
    vm.removeProfileFromPartner = removeProfileFromPartner;
    vm.onSelectUserFromTypeAhead = onSelectUserFromTypeAhead;
    vm.getShouldDisableUserSelectionReason = getShouldDisableUserSelectionReason;
    vm.addAnotherUserToPartner = addAnotherUserToPartner;
    vm.addExistingUserToPartner = addExistingUserToPartner;
    vm.validateAndSave = validateAndSave;
    vm.onConfirmSave = onConfirmSave;
    vm.onConfirmSaveAndInvite = onConfirmSaveAndInvite;
    vm.saveUsersToPartner = saveUsersToPartner;
    vm.removeNewUser = removeNewUser;
    vm.removeAllUsers = removeAllUsers;
    vm.resetCreateNewUserForm = resetCreateNewUserForm;
    vm.toggleNewUserForm = toggleNewUserForm;
    vm.cancelNewUserForm = cancelNewUserForm;
    vm.partnerHasProfile = partnerHasProfile;
    vm.shouldShowShowMoreProfiles = shouldShowShowMoreProfiles;
    vm.shouldShowShowMoreUsers = shouldShowShowMoreUsers;
    vm.showMoreProfiles = showMoreProfiles;
    vm.showMoreUsers = showMoreUsers;
    vm.userHasError = userHasError;
    vm.hasUserErrors = hasUserErrors;
    vm.onDropProfile = onDropProfile;
    vm.onBulkDropProfile = onBulkDropProfile;
    vm.updateNewUserFullName = updateNewUserFullName;
    vm.updateNewUserUserName = updateNewUserUserName;
    vm.sendManualUserInvite = sendManualUserInvite;
    vm.removeUserFromPartner = removeUserFromPartner;
    vm.disableUser = disableUser;
    vm.reEnableUser = reEnableUser;
    vm.getIconNameForAppId = getIconNameForAppId;
    vm.userMatchesSearch = userMatchesSearch
    vm.profilesLimit = 8;
    vm.usersLimit = 24;
    vm.newUsers = [];

    vm.attachmentsSettings = {
        resourceTypeName: 'temporary-attachments',
        resourceId: guid(),
        isEventsDisabled: true
    };

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;

    init();


    function init() {
        vm.isLongUserDataLoad = false;
        vm.isLongProfileDataLoad = false;

        var userLoadTimer = $timeout(function () {
            vm.isLongUserDataLoad = true;
        }, 700);

        var profileLoadTimer = $timeout(function () {
            vm.isLongProfileDataLoad = true;
        }, 700);

        if (!$scope.PartnerDetail.partner) {
            return;
        }

        userPermissionsAPI.canApplyProfiles().then(function (response) {
            vm.canApplyProfiles = response;
        });

        userPermissionsAPI.canApplyUsers().then(function (response) {
            vm.canApplyUsers = response;
        });

        vm.userDataLoaded = false;
        vm.profileDataLoaded = false;
        vm.hasDisabledUser = false;

        usersAPI.getUsersByPartner($scope.PartnerDetail.partner).then(function (response) {
            $timeout.cancel(userLoadTimer);
            vm.users = response.data;
            vm.isLongUserDataLoad = false;
            vm.userDataLoaded = true;

            vm.users.forEach(function (user) {
                if (!user.enabled) {
                    vm.hasDisabledUser = true;
                }
            });

            partnersAPI.getProfilesForPartner($scope.PartnerDetail.partner).then(function (response) {
                $timeout.cancel(profileLoadTimer);
                vm.profiles = response.data;
                vm.isLongProfileDataLoad = false;
                vm.profileDataLoaded = true;
                partnerProfileUserMapper.mapAllProfilesAndUsers(vm.profiles, vm.users);
            });

        });

        appsAPI.getAllProfiles().then(function (response) {
            vm.allProfiles = response.data;
        });
    }

    function addProfileToPartner() {
        vm.isSavingProfile = true;

        partnersAPI.addProfileToPartner(vm.newProfile, $scope.PartnerDetail.partner).then(function (response) {
            vm.newProfile.associationId = response.data.id;
            vm.profiles.push(vm.newProfile);
            vm.newProfile = '';
            vm.isSavingProfile = false;
            vm.isAddingProfile = false;
        });
    }

    function removeProfileFromPartner(profile) {
        partnersAPI.removeProfileFromPartner(profile, $scope.PartnerDetail.partner);
        _.remove(vm.profiles, {associationId: profile.associationId});
    }

    function onSelectUserFromTypeAhead(user) {
        vm.newUser = user;
    }

    function getShouldDisableUserSelectionReason(user) {
        if (!user) {
            return;
        }

        if (_.find(vm.users, {id: user.id})) {
            return '(' + $scope.PartnerDetail.partner.name + ' already has this user)';
        }

        if (user.internal) {
            return '(internal users cannot be added to a partner)';
        }

        if (user.type === 'svc') {
            return '(service users cannot be added to a partner)';
        }
    }

    function addExistingUserToPartner() {
        vm.isSavingUser = true;

        var formattedUser = {
            ldapUserId: vm.newUser.userName,
            userName: vm.newUser.fullName,
            id: vm.newUser.id || vm.newUser.wwtUserId
        };

        partnersAPI.addUserToPartner(formattedUser, $scope.PartnerDetail.partner).then(function () {
            vm.isSavingUser = false;
            vm.users.push(vm.newUser);
            vm.newUser = '';
            vm.isAddingUser = false;
        });
    }

    function processImport(imported) {
        imported.forEach(function (it) {
            vm.userFirstName = it.firstName;
            vm.userLastName = it.lastName;
            vm.userEmail = it.email || '';

            addAnotherUserToPartner();
        });

        vm.processImportComplete = true;

        $timeout(function () {
            vm.processImportComplete = false;
        }, 2800);

    }

    function userHasError(user) {
        vm.containsDuplicateEmail = false;

        if (_.filter(vm.newUsers, {email: user.email}).length > 1) {
            vm.containsDuplicateEmail = true;
            return true;
        }

        if (user.isExistingUser) {
            vm.isExistingUser = true;
            return true;
        }

        if (!user.firstName || !user.lastName || !user.email) {
            vm.missingUserInfo = true;
            return true;
        }
    }

    function hasUserErrors() {
        return _.filter(vm.newUsers, userHasError);
    }

    function addAnotherUserToPartner() {
        var newUserData = {
            fullName: vm.userFirstName + ' ' + vm.userLastName,
            firstName: vm.userFirstName,
            lastName: vm.userLastName,
            userName: vm.userEmail.toLowerCase(),
            email: vm.userEmail.toLowerCase(),
            enabled: true,
            internal: false,
            type: 'external'
        };

        vm.newUsers.push(newUserData);

        resetCreateNewUserForm();
    }

    function validateAndSave() {
        if (vm.userFirstName && vm.userLastName && vm.userEmail) {
            addAnotherUserToPartner();
        }

        return usersAPI.getUsersByUserNames(_.map(vm.newUsers, 'email')).then(function (usersResponse) {
            var existingUsers = usersResponse.data;

            var hasExistingUser = _.filter(vm.newUsers, function (it) {
                return _.find(existingUsers, {userName: it.email})
            });

            if (hasExistingUser && hasExistingUser.length) {
                if (hasExistingUser.length === 1) {
                    messenger.showMessage({
                        "type": "error validation-failed",
                        "title": "Oops... " + hasExistingUser.length + " user already exists",
                        "content": "Please check the email address, or remove the duplicated user to proceed. Existing users can be added to partner from the 'Add User' form.",
                        "isDismissable": false,
                        customActions: [
                            {
                                title: 'Dismiss',
                                mood: 'cancel',
                                actionFunction: function () {
                                    messenger.dismissMessage();
                                }
                            }
                        ]
                    });
                }

                if (hasExistingUser.length > 1) {
                    messenger.showMessage({
                        "type": "error validation-failed",
                        "title": "Oops... " + hasExistingUser.length + " users already exist",
                        "content": "Please check the email address, or remove each duplicated user to proceed. Existing users can be added to partner from the 'Add User' form.",
                        "isDismissable": false,
                        customActions: [
                            {
                                title: 'Dismiss',
                                mood: 'cancel',
                                actionFunction: function () {
                                    messenger.dismissMessage();
                                }
                            }
                        ]
                    });
                }

                hasExistingUser.forEach(function (user) {
                    user.isExistingUser = true
                });

                return $q.reject(hasExistingUser)
            } else {
                wwtFocusPanelSVC.togglePanel('newUserSetupForm')
                return $q.when(hasExistingUser)
            }
        });
    }

    function saveUsersToPartner(shouldInvite) {
        vm.isSavingUser = true;

        if (vm.userFirstName && vm.userLastName && vm.userEmail) {
            addAnotherUserToPartner();
        }

        return usersAPI.addUsers(vm.newUsers, shouldInvite).then(function (userResponses) {
            var requests = [];

            userResponses.forEach(function (response) {
                var createdUser = response.data;

                vm.users.push(response.data);

                requests.push(partnersAPI.addUserToPartner(createdUser, $scope.PartnerDetail.partner));

                if (vm.selectedProfiles && vm.selectedProfiles.length) {
                    vm.selectedProfiles.forEach(function (profile) {
                        requests.push(appsAPI.linkUserToProfile(profile, createdUser))
                    })
                }

                var updatedUserDefaults = {
                    defaultApplication: {
                        id: vm.selectedApp.id
                    },
                    user: {
                        id: createdUser.id
                    },
                    isOpenSideNavAppInTab: false
                };

                requests.push(usersAPI.updateUserPreferences(updatedUserDefaults));
            });

            return $q.all(requests).then(function (responses) {
                vm.isCreatingNewUsers = false;
                vm.isSavingUser = false;
                vm.newUsers = [];
                partnerProfileUserMapper.mapAllProfilesAndUsers(vm.profiles, vm.users);
                return responses
            })
        });
    }

    function onConfirmSave() {
        messenger.showMessage({
            "type": "user-creation",
            "title": "Creating Users...",
            "content": "An invitation WILL NOT be sent to the user once they are set up.",
            "isDismissable": false,
            "working": true
        });

        wwtFocusPanelSVC.closePanel('newUserSetupForm')

        $timeout(function () {
            saveUsersToPartner().then(function () {
                messenger.showMessage({
                    "type": "success user-creation-success",
                    "title": "All users have been created!",
                    "content": "",
                    "isDismissable": false
                });

                $timeout(function () {
                    messenger.dismissMessage();
                }, 3000);
            });

        }, 3000);

    }

    function onConfirmSaveAndInvite() {
        messenger.showMessage({
            "type": "user-creation",
            "title": "Creating Users...",
            "content": "An invitation WILL be sent to the user once they are set up.",
            "isDismissable": false,
            "working": true
        });

        wwtFocusPanelSVC.closePanel('newUserSetupForm')

        $timeout(function () {
            saveUsersToPartner(true).then(function () {
                messenger.showMessage({
                    "type": "success user-creation-success",
                    "title": "All users have been created!",
                    "content": "They will receive an email shortly with their account setup instructions.",
                    "isDismissable": false
                });

                $timeout(function () {
                    messenger.dismissMessage();
                }, 4000);
            });

        }, 3000);

    }

    function updateNewUserFullName(newUser) {
        newUser.fullName = newUser.firstName + ' ' + newUser.lastName;
    }

    function updateNewUserUserName(newUser) {
        newUser.userName = newUser.email;
        newUser.isExistingUser = false
    }

    function sendManualUserInvite(user) {
        user.isProcessing = true;

        $timeout(function () {
            user.isProcessing = false;
            user.isDoneProcessing = true;
        }, 800);

        $timeout(function () {
            user.isDoneProcessing = false;
            user.isPromptingToSendInvite = false;
        }, 2400);

        return registrationAPI.generatePin(user.userName, 'setup');
    }

    function removeNewUser(newUser) {
        var index = vm.newUsers.indexOf(newUser);
        vm.newUsers.splice(index, 1);
    }

    function removeAllUsers() {
        vm.newUsers = [];
        vm.isPromptingToDeleteAllUsers = false;
    }

    function resetCreateNewUserForm() {
        vm.userFirstName = '';
        vm.userLastName = '';
        vm.userEmail = '';
    }

    function toggleNewUserForm() {
        vm.isCreatingNewUsers = true;
        vm.isSettingUserDefaults = true;

        appsAPI.getApps().then(function (response) {

            vm.apps = response.data;

            var defaultExternalApplication = _.find(response.data, function (it) {
                return it.defaultExternalApp === 'Y'
            })

            vm.selectedApp = defaultExternalApplication
        })
    }

    function cancelNewUserForm() {
        resetCreateNewUserForm();
        vm.isCreatingNewUsers = false;
        vm.isAddingUser = false;
    }

    function partnerHasProfile(profile) {
        return _.find(vm.profiles, {id: profile.id});
    }

    function shouldShowShowMoreProfiles() {
        return vm.profiles && !vm.profilesSearchText && (vm.profiles.length > vm.profilesLimit);
    }

    function showMoreProfiles() {
        vm.profilesLimit += vm.profiles.length;
    }

    function shouldShowShowMoreUsers() {
        return vm.users && !vm.usersSearchText && (vm.users.length > vm.usersLimit);
    }

    function showMoreUsers() {
        vm.usersLimit += vm.users.length;
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function onDropProfile($data, $event, user) {
        var profile = $data['json/custom-object'];

        addProfileForUser(profile, user);
    }

    function onBulkDropProfile($data, $event) {
        var profile = $data['json/custom-object'];

        var userRequests = [];

        vm.users.forEach(function (user) {
            userRequests.push(addProfileForUser(profile, user));
        });

        $q.all(userRequests).then(function (responses) {
            partnerProfileUserMapper.mapAllProfilesAndUsers(vm.profiles, vm.users);
        });
    }

    function addProfileForUser(profile, user) {
        if (!user.enabled) {
            return;
        }

        user.isAddingProfileToUser = true;

        var formattedUser = {
            ldapUserId: user.userName,
            userName: user.userName,
            id: user.id
        };

        return appsAPI.linkUserToProfile(profile, formattedUser).then(function (response) {
            user.isAddingProfileToUser = false;
            user.isProfileAddedToUser = true;

            $timeout(function () {
                user.isProfileAddedToUser = false;
            }, 2500);

            partnerProfileUserMapper.mapAllProfilesAndUsers(vm.profiles, vm.users);

            return response;
        });
    }

    function removeUserFromPartner(user) {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to remove this user from the partner? This user may no longer have a partner association once removed.",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        messenger.dismissMessage();
                    }
                },
                {
                    title: 'Remove User',
                    mood: 'success',
                    actionFunction: function () {
                        onConfirmRemoveUser(user)
                    }
                }
            ]
        });
    }

    function onConfirmRemoveUser(user) {
        messenger.showMessage({
            "type": "warning",
            "title": "Removing user from partner...",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        $timeout(function () {
            usersAPI.removeUserFromPartner(user, $scope.PartnerDetail.partner).then(function () {
                _.remove(vm.users, {associationId: user.associationId});

                messenger.showMessage({
                    "type": "success",
                    "title": "User has been removed!",
                    "content": "",
                    "isDismissable": false
                });

                $timeout(function () {
                    messenger.dismissMessage();
                }, 1500);
            });

        }, 950);

    }

    function disableUser(user) {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to disable this user?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        messenger.dismissMessage();
                    }
                },
                {
                    title: 'Disable User',
                    mood: 'success',
                    actionFunction: function () {
                        onConfirmDisable(user)
                    }
                }
            ]
        });
    }

    function onConfirmDisable(user) {
        messenger.showMessage({
            "type": "warning",
            "title": "Disabling User...",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        $timeout(function () {

            vm.hasDisabledUser = true;
            user.enabled = false;

            usersAPI.updateUser(user).then(function () {
                messenger.showMessage({
                    "type": "success",
                    "title": "User is now disabled!",
                    "content": "",
                    "isDismissable": false
                });

                $timeout(function () {
                    messenger.dismissMessage();
                }, 1500);
            });

        }, 950);

    }

    function reEnableUser(user) {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to re-enable this user?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        messenger.dismissMessage();
                    }
                },
                {
                    title: 'Re-enable User',
                    mood: 'success',
                    actionFunction: function () {
                        onConfirmReEnable(user)
                    }
                }
            ]
        });
    }

    function onConfirmReEnable(user) {
        messenger.showMessage({
            "type": "warning",
            "title": "Re-enabling User...",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        $timeout(function () {

            user.enabled = true;

            usersAPI.updateUser(user).then(function () {
                messenger.showMessage({
                    "type": "success",
                    "title": "User is now active!",
                    "content": "",
                    "isDismissable": false
                });

                $timeout(function () {
                    messenger.dismissMessage();
                }, 1500);

            });

        }, 950);

    }

    function getIconNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return
        }

        appId = parseInt(appId)

        var app = _.find(vm.apps, {id: appId})

        if (!app) {
            return
        }

        return app.iconName
    }

    function userMatchesSearch(user) {
        if (!vm.usersSearchText || !user) {
            return true
        }
        return user.userName.toLowerCase().includes(vm.usersSearchText.toLowerCase()) ||
            user.fullName.toLowerCase().includes(vm.usersSearchText.toLowerCase())
    }

    $scope.$on('attFileUploaded-' + vm.attachmentsSettings.resourceId, function (event, f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {type: 'binary'});

            // use first worksheet
            var worksheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];

            // put the processed JSON on vm
            processImport(XLSX.utils.sheet_to_json(worksheet, {raw: true}));
        };

        reader.readAsBinaryString(f);
    });

    vm.getCreateUserBtnText = function (form) {

        if (!vm.newUsers.length || vm.newUsers.length === 1 && !form.$valid) {
            return 'Create User and Save'
        }

        if (vm.newUsers.length === 1 && form.$valid) {
            return 'Create ' + (parseInt(vm.newUsers.length) + 1) + ' Users and Save'
        }

        if (vm.newUsers.length > 1 && !form.$valid) {
            return 'Create ' + vm.newUsers.length + ' Users and Save'
        }

        if (vm.newUsers.length > 1 && form.$valid) {
            return 'Create ' + (parseInt(vm.newUsers.length) + 1) + ' Users and Save'
        }

    }

}
