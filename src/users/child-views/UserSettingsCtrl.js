appModule.controller('UserSettingsCtrl', makeUserSettingsCtrl);

function makeUserSettingsCtrl($scope, $state, $timeout, usersAPI, appsAPI, registrationAPI, userEvents, messenger) {
    var vm = this;

    vm.updateUser = updateUser;
    vm.sendManualUserInvite = sendManualUserInvite;
    vm.disableUser = disableUser;
    vm.reEnableUser = reEnableUser;
    vm.updateUserDefaultAppInUi = updateUserDefaultAppInUi;
    vm.getIconNameForAppId = getIconNameForAppId;
    vm.isWWTDemoUser = isWWTDemoUser;

    init();


    function init() {
        appsAPI.getApps().then(function (response) {
            vm.apps = response.data;

            if (!_.get($scope.UserDetail, 'user')) {
                return
            }

            usersAPI.getDefaultAppByUser($scope.UserDetail.user).then(function (response) {
                vm.userPreferences = response.data;

                if (!_.get(vm.userPreferences, 'defaultApplication.id')) {
                    return
                }

                vm.defaultApp = _.find(vm.apps, function (app) {
                    return app.id === vm.userPreferences.defaultApplication.id
                });
            });

            if (_.get($scope.UserDetail, 'user.type') === 'external' && isWWTDemoUser()) {
                usersAPI.getUserSetPasswordLink($scope.UserDetail.user).then(function (response) {

                    vm.getPasswordSetupLink = response.data[0].notificationActions[0].url;
                })
            }

        });

    }

    function updateUser() {
        vm.isUpdatingUser = true;

        updateUserPreferences();

        $scope.UserDetail.user.fullName = $scope.UserDetail.user.firstName + ' ' + $scope.UserDetail.user.lastName;

        if (!$scope.UserDetail.user.internal && $scope.UserDetail.user.type !== 'svc') {
            $scope.UserDetail.user.userName = $scope.UserDetail.user.email
        }

        usersAPI.updateUser($scope.UserDetail.user).then(function () {
            vm.isUpdatingUser = false;
            vm.hasUpdatedUser = true;

            $timeout(function () {
                $state.go('userDetail.settings', { userName: $scope.UserDetail.user.userName })
                vm.hasUpdatedUser = false;
            }, 1000);
        });

    }

    function updateUserPreferences() {
        if (vm.userPreferences.id == null && (vm.userPreferences.defaultApplication.id == vm.defaultApp.id)) {
            return;
        }

        var updatedUserDefaults = {
            defaultApplication: {
                id: vm.userPreferences.defaultApplication.id
            },
            user: {
                id: $scope.UserDetail.user.id
            }
        };

        _.merge(vm.userPreferences, updatedUserDefaults);

        usersAPI.updateUserPreferences(vm.userPreferences);
    }

    function updateUserDefaultAppInUi(selectedApp) {
        vm.userPreferences.defaultApplication = selectedApp;
    }

    function getIconNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return;
        }

        appId = parseInt(appId);

        var app = _.find(vm.apps, {id: appId});

        if (!app) {
            return;
        }

        return app.iconName;
    }

    function sendManualUserInvite() {
        vm.isProcessing = true;

        $timeout(function () {
            vm.isProcessing = false;
            vm.isDoneProcessing = true;
        }, 800);

        $timeout(function () {
            vm.isDoneProcessing = false;
            vm.isPromptingToSendInvite = false;
        }, 2400);

        return registrationAPI.generatePin($scope.UserDetail.user.userName, 'setup');
    }

    function disableUser() {
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
                    actionFunction: onConfirmDisable
                }
            ]
        });
    }

    function onConfirmDisable() {
        messenger.showMessage({
            "type": "warning",
            "title": "Disabling User...",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        $timeout(function () {

            $scope.UserDetail.user.enabled = false;

            usersAPI.updateUser($scope.UserDetail.user).then(function () {
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

    function reEnableUser() {
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
                    actionFunction: onConfirmReEnable
                }
            ]
        });
    }

    function onConfirmReEnable() {
        messenger.showMessage({
            "type": "warning",
            "title": "Re-enabling User...",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        $timeout(function () {

            $scope.UserDetail.user.enabled = true;

            usersAPI.updateUser($scope.UserDetail.user).then(function () {
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

    function isWWTDemoUser() {
        return $scope.UserDetail.user.userName.includes('@wwtdemo.com')
    }

}
