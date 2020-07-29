appModule.controller('ProfilesCtrl', makeProfilesCtrl);

function makeProfilesCtrl(appsAPI, $timeout, $state, userPermissionsAPI, $scope, envExtended, recentlyViewed, aboutProfileGroupConversionUrl) {
    var vm = this;

    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.profilesLimit = 24;
    vm.createProfile = createProfile;
    vm.checkIfProfileExists = checkIfProfileExists;
    vm.doesProfileExist = false

    vm.newProfile = {};

    $scope.envExtended = envExtended;
    $scope.aboutProfileGroupConversionUrl = aboutProfileGroupConversionUrl;

    init();

    function init() {
        userPermissionsAPI.canApplyProfiles().then(function (response) {
            vm.canApplyProfiles = response;
        });

        userPermissionsAPI.isDeveloper().then(function (response) {
            vm.isDeveloper = response;
        });

        userPermissionsAPI.canViewProfiles().then(function (response) {
            vm.canViewProfiles = response;

            var loadTimer = $timeout(function () {
                vm.isLongLoad = true;
            }, 700);

            appsAPI.getAllProfiles().then(function (response) {
                $timeout.cancel(loadTimer);
                vm.isLongLoad = false;
                vm.profiles = response.data;

                recentlyViewed.get('profiles', vm.profiles).then(function (recentResponse) {
                    vm.recentProfiles = recentResponse.data
                })
            });
        });
    }

    function createProfile() {
        vm.newProfile.isSavingNewProfile = true;

        appsAPI.createProfile(vm.newProfile).then(function (response) {
            $state.go('profileDetail', { profileId: response.data.id });
        });
    }

    function shouldShowShowMore() {
        return vm.profiles && !vm.profilesSearchText && (vm.profiles.length > vm.profilesLimit);
    }

    function checkIfProfileExists() {
        vm.doesProfileExist = false
        if(vm.newProfile.name) {
            for (var i = 0; i < vm.profiles.length; i++) {
                if (vm.profiles[i].name.toLowerCase() === vm.newProfile.name.toLowerCase()) {
                    vm.doesProfileExist = true
                }
            }
        }
    }

    function showMore() {
        vm.profilesLimit += vm.profiles.length;
    }
}
