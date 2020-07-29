appModule.controller('ApiCardCtrl', makeApiCardCtrl)

function makeApiCardCtrl($scope, apisAPI, $state, $timeout, featureFlagsSVC, wwtEnv) {
    var vm = this

    vm.overrideIsActive = overrideIsActive;
    vm.toggleOverrideState = toggleOverrideState;
    vm.findOverrideFromApi = findOverrideFromApi;
    vm.overrideIsSvcUser = overrideIsSvcUser;
    vm.env = wwtEnv.getEnv();
    $scope.featureFlagsSVC = featureFlagsSVC;
    var userOverrides = []

    $scope.$on('all-overrides-turned-on', function (event) {
        vm.allOverridesToggledOn = true
        vm.allOverridesToggledOff = false
        overrideIsActive()

        if ($scope.api.isEnabledFlag === false) {
            $scope.api.isEnabledFlag = true
        }
    });

    $scope.$on('all-overrides-turned-off', (event) => {
        vm.allOverridesToggledOff = true
        vm.allOverridesToggledOn = false
        overrideIsActive()

        if ($scope.api.isEnabledFlag === true) {
            $scope.api.isEnabledFlag = false
        }
    });

    init()

    function init() {
        apisAPI.getOverridesForUser().then(function (response) {
            userOverrides = response.data;
        });
    }

    function findOverrideFromApi(api) {
        if (!api || !userOverrides || !userOverrides.length) {
            return false;
        }

        return _.find(userOverrides, {'apiId': api.id});
    }

    function toggleOverrideState(api) {
        var override = findOverrideFromApi(api);

        if (!override) {
            return false;
        }
        override.isEnabledFlag = !override.isEnabledFlag;
        $scope.$emit('single-override-state-changed', override);
        return apisAPI.updateOverride(override);
    }

    function overrideIsActive(api) {
        if (vm.allOverridesToggledOn) {
            return true
        }

        if (vm.allOverridesToggledOff) {
            return false
        }

        var override = findOverrideFromApi(api)

        if (!override) {
            return false
        }

        return override.isEnabledFlag
    }

    function overrideIsSvcUser(override) {
        return _.startsWith(_.get(override, 'user.userName'), 'svc_') ||
                _.get(override, 'user.type') === 'svc'
    }
}
