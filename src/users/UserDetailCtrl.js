appModule.controller('UserDetailCtrl', makeUserDetailCtrl);

function makeUserDetailCtrl($scope, usersAPI, partnersAPI, $state, $stateParams, usersRoutes, dtTitleSVC, envExtended, userPermissionsAPI, hotkeys, recentlyViewed, messenger, $timeout) {
    var vm = this;

    vm.addPartnerToUser = addPartnerToUser;
    vm.userHasPartner = userHasPartner;
    vm.shouldShowTab = shouldShowTab;
    vm.tabs = usersRoutes();
    vm.onDropImage = onDropImage

    $scope.envExtended = envExtended;

    init();

    $scope.$on('resourceEventStreamLoaded-event-type', function () {
        $scope.$broadcast('force-wwt-scroll-trap-refresh', { instanceName: 'historyPanelScrollTrap' });
    });

    function init() {
        vm.dataLoaded = false;

        userPermissionsAPI.canViewUsers().then(function (response) {
            vm.canViewUsers = response;

            if (!vm.canViewUsers) {
                return;
            }

            var searchMethod = usersAPI.getUserByWwtUserId

            if (stringIsId($stateParams.userName)) {
                // search is user name
                searchMethod = usersAPI.getUserById
            }

            searchMethod($stateParams.userName).then(function (response) {
                vm.user = response.data[0] || response.data;

                if (response.data.length > 1) {
                    showMultipleUserMessage(response.data)
                }

                vm.resourceEventStreamSettings = {
                    resourceTypeId: 'user',
                    resourceId: vm.user.id
                }

                setPageTitle();
                recentlyViewed.save('users', vm.user);

                if (_.size(_.get(vm.user, 'profile.contacts'))) {
                    vm.user.profile.contacts.forEach(function (contact) {
                        if (contact.type == 'phone') {
                            vm.phoneNumber = contact.value
                        }
                    })
                }

                if (!vm.user.internal) {
                    usersAPI.getPartnersForUserId(vm.user.wwtUserId).then(function (response) {
                        vm.partners = response.data;
                        vm.dataLoaded = true;


                    });
                }
            });
        });
    }

    function addPartnerToUser() {
        vm.isSavingPartner = true;

        partnersAPI.addPartnerToUser($scope.UserDetail.user, vm.newPartner).then(function () {
            vm.partners.push(vm.newPartner);
            vm.newPartner = '';
            vm.isSavingPartner = false;
            vm.isAddingPartner = false;
        });
    }

    function shouldShowTab(tab) {
        if (tab.slug !== 'partners') {
            return true;
        }

        if (vm.user && !vm.user.internal && (vm.user.type === "external" || vm.user.type === "old")) {
            return true;
        }
    }

    function showMultipleUserMessage(users) {
        var message = {
            type: 'warning',
            title: 'Multiple Accounts',
            content: 'This user name has multiple accounts. Which one would you like to manage?',
            isDismissable: false,
            show: true,
            customActions: []
        }

        users.forEach(function (user) {
            message.customActions.push({
                title: user.fullName || (user.firstName + ' ' + user.lastName),
                mood: 'success',
                actionFunction: function () {
                    return selectUserToManage(user)
                }
            })
        })

        messenger.showMessage(message);
    }

    function stringIsId(str) {
        return isNaN(str)
    }

    function selectUserToManage(user) {
        $state.go('userDetail', { userName: user.wwtUserId })
        messenger.dismissMessage()
    }

    function userHasPartner(partner) {
        return _.find(vm.partners, { partnerGroupId: partner.partnerGroupId });
    }

    function setPageTitle() {
        dtTitleSVC.set($state.current.data.browserTitle + ' | ' + vm.user.fullName + ' | Dev Tool Belt');
    }

    function goToSettingsTab() {
        if ($state.is('userDetail.settings')) {
            return false;
        }

        $state.go('userDetail.settings');
    }

    function onDropImage($files) {
        messenger.showMessage({
            "type": "warning",
            "title": "Inconsistent Images?",
            "content": "Uploading a user image here will not replace the user's United image so the two will not match.",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: messenger.dismissMessage
                },
                {
                    title: 'Upload',
                    mood: 'success',
                    actionFunction: function () {
                        uploadImage($files)
                    }
                }
            ]
        });
    }

    function uploadImage($files) {
        messenger.showMessage({
            "type": "warning",
            "title": "Uploading",
            "content": "The image is currently uploading.",
            "isDismissable": false,
            "working": true
        });

        return usersAPI.uploadImage(vm.user, $files[0]).then(function (response) {
            messenger.showMessage({
                "type": "success",
                "title": "Upload Complete",
                "content": "",
                "isDismissable": false
            });

            vm.hidUserImage = true

            $timeout(function () {
                vm.hidUserImage = false
                messenger.dismissMessage()
            }, 2000)
        })
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'userDetail') {
            $state.go('.groups');
        }
    });

    hotkeys.bindTo($scope)
        .add({
            combo: 'shift+s',
            description: 'Go to Settings Tab',
            callback: function (event, hotkey) {
                event.preventDefault();
                goToSettingsTab();
            }
        });
}
