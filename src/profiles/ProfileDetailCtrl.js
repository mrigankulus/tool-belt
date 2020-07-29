appModule.controller('ProfileDetailCtrl', makeProfileDetailCtrl);

function makeProfileDetailCtrl($scope, $state, $stateParams, appsAPI, profileRoutes, envExtended, userPermissionsAPI, hotkeys, recentlyViewed, Group, aboutProfileGroupConversionUrl) {
    var vm = this;

    vm.tabs = profileRoutes();
    vm.getFriendlyTabTitle = getFriendlyTabTitle
    vm.groupDetailUrl = '/groups/groups/wwt-profile:' + $stateParams.profileId
    vm._callerRights = {}
    $scope.envExtended = envExtended;
    $scope.aboutProfileGroupConversionUrl = aboutProfileGroupConversionUrl

    init();

    function init() {
        userPermissionsAPI.isDeveloper().then(function (response) {
            vm.isDeveloper = response;
        });

        userPermissionsAPI.canViewProfiles().then(function (response) {
            vm.canViewProfiles = response;

            Group.findById('wwt-profile:' + $stateParams.profileId).then(function (response) {
                vm._callerRights = _.get(response, 'data._callerRights', {})
            })

            appsAPI.getProfileById($stateParams.profileId).then(function (response) {
                vm.profile = response.data;

                vm.watcherSettings = {
                    resourceTypeId: 'user-security-profile',
                    resourceId: $stateParams.profileId,
                    resourceData: $scope.ProfileDetail.profile,
                    position: 'alignRight'
                };

                vm.resourceEventStreamSettings = {
                    resourceTypeId: 'user-security-profile',
                    resourceId: $stateParams.profileId,
                };

                recentlyViewed.save('profiles', vm.profile)
            });
        });
    }

    function goToSettingsTab() {
        if ($state.is('profileDetail.settings')) {
            return false;
        }

        $state.go('profileDetail.settings');
    }

    function getFriendlyTabTitle(str) {
        return _.snakeCase(str).replace(/_/g, ' ')
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'profileDetail') {
            $state.go('.roles');
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
