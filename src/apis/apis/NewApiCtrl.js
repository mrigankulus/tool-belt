appModule.controller('NewApiCtrl', makeNewApiCtrl);

function makeNewApiCtrl($state, $scope, assetState, apisAPI, userPermissionsAPI, featureFlagsSVC, googleAnalytics) {
    var vm = this;

    vm.onRepoConnected = onRepoConnected;
    vm.create = create;
    vm.isCloudFoundryPlatformAPI = isCloudFoundryPlatformAPI;
    vm.calculateNextAPIVersion = calculateNextAPIVersion;
    vm.validVersion = 1;


    vm.api = {
        routeType: 'proxy'
    };

    // todo: this doesn't appear to be a dynamic list in apirouter, but we should make sure.
    vm.proxyOptions = ['proxy', 'redirect', 'location'];

    vm.onRepoConnected = onRepoConnected;
    $scope.featureFlagsSVC = featureFlagsSVC;
    $scope.assetState = assetState;
    init();

    function init() {
        if ($state.is('apiDetail.versions')) {
            vm.api.apiName = $scope.assetState.currentAsset.apiName
        }

        apisAPI.getAvailablePlatforms().then(function (response) {
            vm.availablePlatforms = response.data;

            vm.api.platform = _.find(vm.availablePlatforms, { 'platformName': 'CloudFoundry' });
        });

        checkPermissions();
        calculateNextAPIVersion();
    }

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

        userPermissionsAPI.canEditApis().then(function (response) {
            vm.canEditApis = response;
            vm.permissionsHaveLoaded = true;
        });
    }

    function onRepoConnected(repo) {
        vm.api.apiName = repo.name;
        vm.api.description = repo.description;

        // todo: we should pre-fill keywords from package.json if they're there.
        vm.api.keywords = [];

        vm.api.connectedRepos = [{
            org: repo.owner.login,
            repo: repo.name
        }];
    }

    function create() {
        vm.api.isWorking = true;
        if (featureFlagsSVC.flagIsActive('versioning')) {
            vm.api.version = vm.validVersion

            if (vm.validVersion === 1) {
                vm.api.versionDefault = true
            } else {
                vm.api.versionDefault = false
            }
        } else {
            vm.api.versionDefault = true
            vm.api.version = 1
        }

        if(vm.api.version > 1) {
            googleAnalytics.trackEvent('API Versions', 'Add New Version', vm.api.apiName)
        }

        apisAPI.create(vm.api).then(function (response) {
            $state.go('apiDetail', { id: response.data.id });
            vm.api.isWorking = false;
        });
    }

    function calculateNextAPIVersion() {
        if (featureFlagsSVC.flagIsActive('versioning')) {
            apisAPI.getApiByName(vm.api.apiName).then(function (response) {
                if (response.data.length === 0) {
                    vm.validVersion = 1;
                } else {
                    var maxVersion = Math.max.apply(Math, response.data.map(function (o) {
                        return o.version;
                    }))
                    vm.validVersion = maxVersion + 1;
                    vm.api.validVersion = vm.validVersion
                }
            })
        }
    }

    function isCloudFoundryPlatformAPI() {
        return vm.api && vm.api.platform && (vm.api.platform.platformName === 'CloudFoundry' || vm.api.platform.platformName === 'Cloud Foundry');
    }
}
