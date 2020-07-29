appModule.controller('ApplicationDetailCtrl', makeApplicationDetailCtrl);

function makeApplicationDetailCtrl($scope, appsAPI, $state, appRoutes, dtTitleSVC, githubAPI, assetState, assetGroups, dashboardSVC, userPermissionsAPI, envExtended, hotkeys, recentlyViewed) {

    var vm = this;

    vm.application = {};
    vm.tabs = appRoutes();
    vm.getAppLink = appsAPI.getAppLink;

    // exposing init on vm so it can be used to reset
    // the application when "cancel"ing updates.
    vm.init = init;

    vm.checkPermissions = checkPermissions;
    vm.getRepoURL = getRepoURL;
    vm.shouldShowTabsDotDotDot = shouldShowTabsDotDotDot;
    vm.isDotDotDotActive = isDotDotDotActive;

    $scope.assetState = assetState;
    $scope.envExtended = envExtended;

    init();

    function init() {
        assetState.setCurrentAsset({});
        assetState.currentAsset.isLoading = true;

        appsAPI.getAppById($state.params.id).then(function (response) {
            vm.application = response.data;
            setPageTitle();

            // todo: tossing asset on scope so it's easier to use in
            // shared sub views. There's a better way (probably via a directive).
            $scope.asset = vm.application;
            assetState.setCurrentAsset(vm.application);
            assetState.currentAsset.isLoading = false;
            setPrimaryRepo();
            decorateAsset();
            checkPermissions();

            vm.watcherSettings = {
                resourceTypeId: 'application',
                resourceId: vm.application.id,
                resourceData: {
                    appName: vm.application.appName
                },
                position: 'alignRight'
            };

            recentlyViewed.save('applications', vm.application)

        }).catch(function (err) {
            if (err.status === 404) {
                $state.go('404');
            }
        });
    }

    function setPageTitle() {
        dtTitleSVC.set($state.current.data.browserTitle + ' | ' + vm.application.appName + ' | Dev Tool Belt');
    }

    function setPrimaryRepo() {
        var repos = vm.application.connectedRepos;

        if (!repos || !repos.length) {
            return false;
        }

        githubAPI.decodePackageJSON(repos[0].org, repos[0].repo).then(function (response) {
            assetState.currentAsset.packageJson = response;
        });
    }

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

        userPermissionsAPI.isDeveloper().then(function (response) {
            if (response === false) {
                goToPermissionsTab()
            }
            vm.isDeveloper = response;
        });

        userPermissionsAPI.canEditApps().then(function (response) {
            vm.canEditApps = response;
            vm.permissionsHaveLoaded = true;
        });
    }

    function getRepoURL() {
        return assetState.currentAsset.connectedRepos && assetState.currentAsset.connectedRepos.length ?
            'https://github.wwt.com/' + assetState.currentAsset.connectedRepos[0].org + '/' + assetState.currentAsset.connectedRepos[0].repo : '';
    }

    function decorateAsset() {
        var asset = assetState.currentAsset;

        asset.update = function () {
            setPrimaryRepo();
            dashboardSVC.onUpdateItem(asset);
            return appsAPI.update(asset);
        };

    }

    function shouldShowTabsDotDotDot() {
        return appRoutes().filter(function (route) {
            return route.inTabsDotDotDot === true
        }).length > 0;
    }

    function isDotDotDotActive() {
        return $state.current.data && $state.current.data.inTabsDotDotDot;
    }

    function goToSettingsTab() {
        if ($state.is('applicationDetail.settings')) {
            return false;
        }

        $state.go('applicationDetail.settings');
    }

    function goToPermissionsTab() {
        if ($state.is('applicationDetail.permissions')) {
            return false;
        }

        $state.go('applicationDetail.permissions');
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'applicationDetail') {
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
