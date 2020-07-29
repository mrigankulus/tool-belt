appModule.controller('ProfileSettingsCtrl', makeProfileSettingsCtrl);

function makeProfileSettingsCtrl($scope, $state, $timeout, appsAPI, messenger, noDeleteProfiles, aboutProfileGroupConversionUrl) {
    var vm = this;

    vm.updateProfile = updateProfile;
    vm.deleteProfile = deleteProfile;
    vm.disableDeleteProfile = disableDeleteProfile;
    $scope.aboutProfileGroupConversionUrl = aboutProfileGroupConversionUrl

    function updateProfile() {
        vm.isUpdatingProfile = true;

        appsAPI.updateProfile($scope.ProfileDetail.profile).then(function () {
            vm.isUpdatingProfile = false;
            vm.hasUpdatedProfile = true;

            $timeout(function () {
                vm.hasUpdatedProfile = false;
            }, 1000);
        });
    }

    function deleteProfile() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to delete this profile? There may still be Users and/or Partners associated to this profile.",
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
                    title: 'Delete',
                    mood: 'success',
                    actionFunction: onConfirmDelete
                }
            ]
        });
    }

    function onConfirmDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Deleting",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        appsAPI.deleteProfile($scope.ProfileDetail.profile).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Profile Removed",
                "content": "",
                "isDismissable": false
            });

            $timeout(function () {
                $state.go('profiles');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });

    }

    function disableDeleteProfile() {
        return noDeleteProfiles.getNoDeleteProfilesList($scope.ProfileDetail.profile)
    }

}
