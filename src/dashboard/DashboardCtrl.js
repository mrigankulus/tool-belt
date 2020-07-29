appModule.controller('DashboardCtrl', function ($scope, $timeout, assetGroups, appsAPI, apisAPI, componentsAPI, $state, navSearch, searcherCollections, dashboardSVC, jenkinsAPI, dragulaService, userPermissionsAPI, recentlyViewed, $q) {

    var vm = this;
    var allStates = $state.get();

    vm.openItem = openItem;
    vm.addNewAsset = addNewAsset;
    vm.assetGroups = assetGroups.groups;
    vm.searcherCollections = searcherCollections;
    vm.getWidgetJumpToLinks = getWidgetJumpToLinks;
    vm.processJenkinsJobs = processJenkinsJobs;
    vm.shouldShowItemBlankSlate = shouldShowItemBlankSlate;
    vm.getSettingsLink = getSettingsLink;

    $scope.dashboardSVC = dashboardSVC;
    $scope.navSearch = navSearch;

    $scope.$on('dashboard-bag.drop', onSortDrop);

    init();

    function init() {
        vm.isLoading = true

        initDragulaService();

        var longLoadTimer = $timeout(function () {
            if (!dashboardSVC.dashboard.items || !dashboardSVC.dashboard.items.length) {
                vm.isLongLoad = true;
            }
        }, 700);

        userPermissionsAPI.isDeveloper().then(function (isDev) {
            var loadDashboardFunction = loadUserAdminDashboard

            if (isDev) {
                loadDashboardFunction = loadDeveloperDashboard
            }

            loadDashboardFunction().then(function () {
                vm.isLongLoad = false;
                $timeout.cancel(longLoadTimer);
                vm.isDeveloper = isDev
                vm.isLoading = false
            })

            // Load and cache all permissions. We don't need them here, but getting
            // them now makes for a snappy experience throughout (since they're cached).
            // If we start calling this in other controllers, we should consider calling this
            // directly in the userPermissionsAPI so the behavior is consistent on every page.
            userPermissionsAPI.getAllPermissions();
        })
    }

    function loadDeveloperDashboard() {
        return dashboardSVC.getOrCreateForUser().then(function (response) {
            dashboardSVC.hydrateTempData();
            processJenkinsJobs();
            return $q.when(response)
        })
    }

    function loadUserAdminDashboard() {
        recentlyViewed.get('applications', vm.apps).then(function (recentResponse) {
            vm.recentApps = recentResponse.data
        })

        recentlyViewed.get('partners', vm.partners).then(function (recentResponse) {
            vm.recentPartners = recentResponse.data
        })

        recentlyViewed.get('groups', vm.groups).then(function (recentResponse) {
            vm.recentGroups = recentResponse.data

            recentlyViewed.get('profiles', vm.profiles).then(function (recentResponse) {
                if (_.size(recentResponse.data)) {
                    // combine recently clicked profiles with groups.
                    // this should make the transition feel a little more
                    // seamless for this user set
                    vm.recentGroups = vm.recentGroups.concat(recentResponse.data.map(function (profile) {
                        return {
                            id: `wwt-profile:${profile.id}`,
                            title: profile.name,
                            description: profile.description
                        }
                    }))

                    vm.recentGroups = _.uniq(vm.recentGroups, 'id')
                }
            })
        })

        recentlyViewed.get('users', vm.users).then(function (recentResponse) {
            vm.recentUsers = recentResponse.data
        })

        return $q.when(true)
    }

    function initDragulaService() {
        dragulaService.options($scope, 'dashboard-bag', {
            moves: function (el, container, handle) {
                return handle.className.indexOf('drag-icon') > -1;
            }
        });
    }

    function onSortDrop() {
        // since we're cloning the dashboard before we update, the drop
        // needs to wait a tic before calling update.
        $timeout(function () {
            dashboardSVC.update();
        }, 50);
    }

    function processJenkinsJobs() {
        dashboardSVC.dashboard.items.forEach(function (item) {
            if (item.data && item.data.connectedJenkinsJobs && item.data.connectedJenkinsJobs.length) {
                var jobs = item.data.connectedJenkinsJobs;

                var requests = [];

                jobs.forEach(function (it) {
                    jenkinsAPI.getJobAndLastBuild('Custom Apps', it.name).then(function (response) {
                        it.lastJobData = response.data;
                    });
                });
            }
        });
    }

    function openItem(item) {
        // trim the last character
        var singularSlug = item.groupSlug.slice(0, -1);
        $state.go(singularSlug + 'Detail', {'id': item.id});
    }

    function addNewAsset(group) {
        if (!group) {
            return false;
        }

        var singularSlug = group.slug.slice(0, -1);

        $state.go('new-' + singularSlug);
    }

    function getWidgetJumpToLinks(item) {
        var links = [],
            matchingStates;


        matchingStates = _.filter(allStates, function (state) {
            return state.name.indexOf(item.type + 'Detail') > -1 && (state.data && !state.data.disabledDashboardJumpto);
        });

        matchingStates.forEach(function (it) {
            it.sref = it.name + '({id: \'' + item.id + '\'})';
        });

        _.remove(matchingStates, function (it) {
            return it.data.browserTitle === 'Component' || it.data.browserTitle === 'Application' || it.data.browserTitle === 'API';
        });

        return matchingStates;
    }

    function shouldShowItemBlankSlate(item) {
        if (!item) {
            return;
        }

        return item.type !== 'myApiRouteOverrides' &&
            item.data &&
            (!item.data.connectedJenkinsJobs || !item.data.connectedJenkinsJobs.length) &&
            (!item.data.connectedRepos || !item.data.connectedRepos.length) &&
            (!item.data.connectedVisionBoards || !item.data.connectedVisionBoards.length);
    }

    function getSettingsLink(item) {
        if (!item.data || !item.id) {
            return false;
        }

        return item.type + 'Detail.settings({id: \'' + item.id + '\' })';
    }
});

