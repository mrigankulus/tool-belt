appModule.controller('ComponentDetailCtrl', makeComponentDetailCtrl);

function makeComponentDetailCtrl($scope, componentsAPI, $state, componentsRoutes, dtTitleSVC, githubAPI, assetState, assetGroups, dashboardSVC, userPermissionsAPI, hotkeys, envExtended, recentlyViewed) {

    var vm = this;

    vm.component = {};
    vm.tabs = componentsRoutes();
    vm.updateComponent = updateComponent;
    vm.shouldShowDeps = shouldShowDeps;
    vm.init = init;
    vm.getRepoURL = getRepoURL;

    $scope.assetState = assetState;
    $scope.envExtended = envExtended;

    init();

    function init() {
        assetState.setCurrentAsset({});
        assetState.currentAsset.isLoading = true;

        componentsAPI.getComponentById($state.params.id).then(function (response) {
            vm.component = response.data || {};
            setPageTitle();

            // todo: tossing asset on scope so it's easier to use in
            // shared sub views. There's a better way (probably via a directive).
            $scope.asset = vm.component;
            assetState.setCurrentAsset(vm.component);
            assetState.currentAsset.isLoading = false;
            setPrimaryRepo();
            decorateAsset();
            checkPermissions();
            recentlyViewed.save('components', vm.component)

            vm.watcherSettings = {
                resourceTypeId: 'ui-component',
                resourceId: vm.component.id,
                position: 'alignRight'
            };
        }).catch(function (err) {
            if (err.status === 404) {
                $state.go('404');
            }
        });
    }

    function setPageTitle() {
        dtTitleSVC.set($state.current.data.browserTitle + ' | ' + vm.component.name + ' | Dev Tool Belt');
    }

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

         userPermissionsAPI.canEditComponents().then(function (response) {
            vm.canEditComponents = response;
            vm.permissionsHaveLoaded = true;
        });
    }

    function getRepoURL() {
        return assetState.currentAsset.connectedRepos && assetState.currentAsset.connectedRepos.length ?
                'https://github.wwt.com/' + assetState.currentAsset.connectedRepos[0].org + '/' + assetState.currentAsset.connectedRepos[0].repo :
                '';
    }

    function updateComponent(component) {
        componentsAPI.update(component);
        setPrimaryRepo();
    }

    function shouldShowDeps(deps) {
        if (!deps) {
            return;
        }

        return Object.keys(deps).length;
    }

    function setPrimaryRepo() {
        var repos = vm.component.connectedRepos;

        if (!repos || !repos.length) {
            return false;
        }

        githubAPI.decodePackageJSON(repos[0].org, repos[0].repo).then(function (response) {
            assetState.currentAsset.packageJson = response;
        });
    }

    function decorateAsset() {
        var asset = assetState.currentAsset;

        asset.update = function () {
            setPrimaryRepo();
            dashboardSVC.onUpdateItem(asset);
            return componentsAPI.update(asset);
        };

    }

    $scope.skipValidation = function(value) {
        return $sce.trustAsHtml(value);
    };

    function goToSettingsTab() {
        if ($state.is('componentDetail.settings')) {
            return false;
        }

        $state.go('componentDetail.settings');
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'componentDetail') {
            $state.go('.activity');
        }

        setPageTitle();
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
