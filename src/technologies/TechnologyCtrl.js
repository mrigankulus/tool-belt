appModule.controller('TechnologyCtrl', makeTechnologyCtrl)

function makeTechnologyCtrl($scope, $state, hotkeys, envExtended, userPermissionsAPI, assetState, technologiesApi, technologyRoutes) {
    var vm = this

    $scope.envExtended = envExtended
    $scope.assetState = assetState
    vm.tabs = technologyRoutes();

    init()

    function init() {
        assetState.setCurrentAsset({});
        assetState.currentAsset.isLoading = true;

        technologiesApi.getById($state.params.id).then(function (response) {
            vm.technology = response.data
            $scope.asset = vm.technology;
            assetState.setCurrentAsset(vm.technology);
            assetState.currentAsset.isLoading = false;
            setPrimaryRepo();
            decorateAsset();
            vm.watcherSettings = {
                resourceTypeId: 'technology',
                resourceId: vm.technology.id,
                position: 'alignRight'
            }
        })

        userPermissionsAPI.canViewTechnologies().then(function (response) {
            vm.canViewTechnologies = response;
        });
    }

    function setPrimaryRepo() {
        var repos = vm.technology.connectedRepos;

        if (!repos || !repos.length) {
            return false;
        }

        // githubAPI.decodePackageJSON(repos[0].org, repos[0].repo).then(function (response) {
        //     assetState.currentAsset.packageJson = response;
        // });
    }

    function decorateAsset() {
        var asset = assetState.currentAsset;

        asset.update = function () {
            setPrimaryRepo();
            return technologiesApi.update(asset);
        };

    }

    function goToSettingsTab() {
        if ($state.is('technologyDetail.settings')) {
            return false;
        }

        $state.go('technologyDetail.settings');
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'technologyDetail') {
            $state.go('.about');
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