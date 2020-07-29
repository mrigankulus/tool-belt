appModule.controller('UserProfilesCtrl', makeUserProfilesCtrl);

function makeUserProfilesCtrl($scope, appsAPI, userPermissionsAPI, $timeout) {
    var vm = this;

    vm.addProfileForUser = addProfileForUser;
    vm.userHasProfile = userHasProfile;
    vm.removeProfileFromUser = removeProfileFromUser;
    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.profilesLimit = 24;

    init();

    $scope.$watch('UserDetail.user', init);

    function init() {
        if (!$scope.UserDetail.user) {
            return;
        }

        vm.dataLoaded = false;
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        userPermissionsAPI.canApplyProfiles().then(function (response) {
            vm.canApplyProfiles = response;
        });

        appsAPI.getProfilesForUser($scope.UserDetail.user.wwtUserId).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.profiles = response.data;
            vm.dataLoaded = true;
        });

        appsAPI.getAllProfiles().then(function (response) {
            vm.allProfiles = response.data;
        });
    }

    function addProfileForUser() {
        vm.isSavingProfile = true;

        var formattedUser = {
            ldapUserId: $scope.UserDetail.user.userName,
            userName: $scope.UserDetail.user.userName,
            id: $scope.UserDetail.user.id
        };

        appsAPI.linkUserToProfile(vm.newProfile, formattedUser).then(function (response) {
            vm.profiles.push(vm.newProfile);
            vm.newProfile = '';
            vm.isSavingProfile = false;
            vm.isAddingProfile = false;
        });
    }

    function removeProfileFromUser(profile) {
        var formattedUser = {
            ldapUserId: $scope.UserDetail.user.userName,
            userName: $scope.UserDetail.user.userName,
            id: $scope.UserDetail.user.id
        };

        _.remove(vm.profiles, {id: profile.id});
        appsAPI.removeUserFromProfile(profile, formattedUser);
    }

    function userHasProfile(profile) {
        return _.find(vm.profiles, {id: profile.id});
    }

    function shouldShowShowMore() {
        return vm.profiles && !vm.profilesSearchText && (vm.profiles.length > vm.profilesLimit);
    }

    function showMore() {
        vm.profilesLimit += vm.profiles.length;
    }
}