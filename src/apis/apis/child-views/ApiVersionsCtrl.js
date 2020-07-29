appModule.controller('APIVersionsCtrl', makeAPIVersionsCtrl)

function makeAPIVersionsCtrl($scope, apisAPI, assetState, $state, featureFlagsSVC, userPermissionsAPI, wwtFocusPanelSVC) {
    var vm = this;

    vm.shouldShowBlankSlate = shouldShowBlankSlate;
    vm.versionsLimitStart = 10;
    vm.versionsLimit = vm.versionsLimitStart;
    $scope.allOverrides;

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;
    init()
    $scope.$watch('asset.id', init);
    $scope.assetState = assetState;
    $scope.featureFlagsSVC = featureFlagsSVC;


    function init(newData, oldData) {
        if (!newData) {
            return false;
        }

        vm.overrides = []
        vm.isLongLoad = false
        vm.isLoadingVersions = false

        vm.apisHaveLoaded = false
        if (!assetState.currentAsset.appName) {
            assetState.currentAsset.appName = assetState.currentAsset.routePrefix
        }

        apisAPI.getApiByName($scope.APIDetail.api.apiName).then(function (response) {
            vm.apis = response.data
            vm.defaultApis = vm.apis.filter(function (el) {
                return el.versionDefault === true
            })
            vm.defaultApi = vm.defaultApis[0]

            vm.apis = vm.apis.filter(function(el) {
                return el.versionDefault != true
            })

            vm.apis.sort(function (a,b) {
                return b.version-a.version
            })

        })
    }
    userPermissionsAPI.canEditApis().then(function (response) {
        vm.canEditApis = response;
    });

    function shouldShowBlankSlate() {
        return !vm.isLoadingVersions && (!vm.apis || !vm.apis.length)
    }
}
