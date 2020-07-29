appModule.controller('APIDetailCtrl', makeAPIDetailCtrl);

function makeAPIDetailCtrl($scope, apisAPI, $state, apiRoutes, dtTitleSVC, githubAPI, assetState, assetGroups, dashboardSVC, userPermissionsAPI, hotkeys, envExtended, recentlyViewed, wwtEnv, featureFlagsSVC) {

    var vm = this;

    vm.api = {};
    vm.tabs = apiRoutes();

    // exposing init on vm so it can be used to reset
    // the api when "cancel"ing updates.
    vm.init = init;

    vm.checkPermissions = checkPermissions;
    vm.getRepoURL = getRepoURL;
    vm.isCloudFoundryPlatformAPI = isCloudFoundryPlatformAPI;
    vm.shouldShowTabsDotDotDot = shouldShowTabsDotDotDot;
    vm.isDotDotDotActive = isDotDotDotActive;
    vm.shouldShowVersionsTab = shouldShowVersionsTab;
    vm.getFriendlyTitle = getFriendlyTitle;

    $scope.assetState = assetState;
    $scope.envExtended = envExtended;
    $scope.featureFlagsSVC = featureFlagsSVC;
    $scope.documentationUrlUsable = false

    init();

    function init() {
        setReportEnv()

        assetState.setCurrentAsset({});

        assetState.currentAsset.isLoading = true;

        apisAPI.getApiById($state.params.id).then(function (response) {
            vm.api = response.data;

            setPageTitle();

            // todo: tossing asset on scope so it's easier to use in
            // shared sub views. There's a better way (probably via a directive).
            $scope.asset = vm.api;
            assetState.setCurrentAsset(vm.api);
            assetState.currentAsset.isLoading = false;
            vm.documentationUrl = assetState.currentAsset.documentationUrl

            if(vm.documentationUrl != null) {
                $scope.documentationUrlUsable = true
            }

            decorateAsset();
            setPrimaryRepo();

            checkPermissions();

            recentlyViewed.save('apis', vm.api)

            vm.watcherSettings = {
                resourceTypeId: 'api',
                resourceId: vm.api.id,
                position: 'alignRight'
            };

            setReports()

        }).catch(function (err) {
            if (err.status === 404) {
                $state.go('404');
            }
        });
    }

    function setReportEnv() {
        var env = wwtEnv.getEnv()

        vm.reportEnv = 'dev'

        if (env === 'tst' || env === 'test') {
            vm.reportEnv = 'tst'
        } else if (env === 'prd' || env === 'prod') {
            vm.reportEnv = 'prd'
        }
    }

    function setReports() {
        vm.reports = [
            {
                title: 'App Logs',
                url: 'https://splunk.wwt.com/en-US/app/search/search?earliest=-1h&latest=now&q=search%20index%3D%22' + vm.reportEnv + '_cf_applications%22%20app%3D%22' + vm.api.routePrefix + '%22&display.page.search.mode=fast&dispatch.sample_ratio=1&display.general.type=events'
            },
            {
                title: 'Execution Times',
                url: 'https://splunk.wwt.com/en-US/app/search/api_metrics?form.environment=' + vm.reportEnv + '&form.time_selector.earliest=-2h&form.time_selector.latest=now&form.apiName=' + vm.api.apiName
            },
            {
                title: 'Container Metrics',
                url: 'https://splunk.wwt.com/en-US/app/search/container_metrics?form.time_selector.earliest=-60m&form.time_selector.latest=now&form.environment=' + vm.reportEnv + '&form.app=' + vm.api.routePrefix
            }
        ]
    }

    function setPageTitle() {
        dtTitleSVC.set($state.current.data.browserTitle + ' | ' + vm.api.apiName + ' | Dev Tool Belt');
    }

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

         userPermissionsAPI.canEditApis().then(function (response) {
            vm.canEditApis = response;
            vm.permissionsHaveLoaded = true;
        });
    }

    function getRepoURL() {
        return assetState.currentAsset.connectedRepos && assetState.currentAsset.connectedRepos.length ?
                'https://github.wwt.com/' + assetState.currentAsset.connectedRepos[0].org + '/' + assetState.currentAsset.connectedRepos[0].repo :
                '';
    }

    function setPrimaryRepo() {
        var repos = vm.api.connectedRepos;

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
            dashboardSVC.onUpdateItem(assetState.currentAsset);
            return apisAPI.update(asset);
        };

    }

    function shouldShowTabsDotDotDot() {
      return apiRoutes().filter(function(route) {
        return route.inTabsDotDotDot === true
      }).length > 0;
    }

    function shouldShowVersionsTab() {
        if (!featureFlagsSVC.flagIsActive('versioning')) {
          vm.tabs = vm.tabs.filter(function (tab) {
              return tab.slug != 'versions'
          })
        }

        return true
    }

    function isDotDotDotActive() {
      return $state.current.data && $state.current.data.inTabsDotDotDot;
    }

    function goToSettingsTab() {
        if ($state.is('apiDetail.settings')) {
            return false;
        }

        $state.go('apiDetail.settings');
    }

    function isCloudFoundryPlatformAPI() {
        return vm.api && vm.api.platform && (vm.api.platform.platformName === 'CloudFoundry' || vm.api.platform.platformName === 'Cloud Foundry');
    }

    function getFriendlyTitle(tabTitle) {
        return _.startCase(tabTitle);
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'apiDetail') {
            $state.go('.overrides');
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
