appModule.controller('NavCtrl', function ($scope, $state, $timeout, navSearch, searcher, hotkeys, searcherCollections, googleAnalytics, userPermissionsAPI, wwtFocusPanelSVC, messenger, featureFlagsSVC) {
    var vm = this;

    vm.isTabActive = isTabActive;
    vm.toggleNavSearch = toggleNavSearch;
    vm.closeNavSearch = closeNavSearch;
    vm.search = search;
    vm.shouldShowNoResults = shouldShowNoResults;
    vm.getActiveBrowserName = getActiveBrowserName;
    vm.isDotDotDotActive = isDotDotDotActive;
    vm.shouldShowDotDotDotMenu = shouldShowDotDotDotMenu;

    vm.searcherCollections = searcherCollections;
    vm.searchTerm = '';

    $scope.featureFlagsSVC = featureFlagsSVC;

    init();

    function init() {
        userPermissionsAPI.isDeveloper().then(function(response) {
            vm.isDeveloper = response;
        });

        userPermissionsAPI.canViewResources().then(function(response) {
            vm.canViewResources = response;
            vm.permissionsHaveLoaded = true;
        });

        userPermissionsAPI.canViewEvents().then(function(response) {
            vm.canViewEvents = response;
        });

        userPermissionsAPI.canViewProfiles().then(function(response) {
            vm.canViewProfiles = response;
        });

        userPermissionsAPI.canViewUsers().then(function(response) {
            vm.canViewUsers = response;
        });

        userPermissionsAPI.canViewPartners().then(function(response) {
            vm.canViewPartners = response;
        });

        userPermissionsAPI.canViewSockets().then(function (response) {
            vm.canViewSockets = response;
        });

        userPermissionsAPI.canViewCronJobs().then(function (response) {
            vm.canViewCronJobs = response;
        });

        userPermissionsAPI.canViewTechnologies().then(function (response) {
            vm.canViewTechnologies = response;
        });

        userPermissionsAPI.canEditApis().then(function (response) {
            vm.canEditApis = response;
        });

        userPermissionsAPI.canEditComponents().then(function (response) {
            vm.canEditComponents = response;
        });

        userPermissionsAPI.canManageTaskTypes().then(function (response) {
            vm.canManageTaskTypes = response;
        });

        userPermissionsAPI.canViewAllGroups().then(function (response) {
            vm.canViewAllGroups = response;
        });
    }

    function isTabActive(state) {
        return $state.is(state + 's') ||
            $state.is('new-' + state) ||
            $state.includes(state + 'Detail') ||
            eventTypesTabIsActive(state) ||
            apisTabIsActive(state);
    }

    function apisTabIsActive(state) {
        // this one requires a bit more logic
        return (state === 'api') &&
                $state.includes('apis');
    }

    function eventTypesTabIsActive(state) {
        // this one requires a bit more logic
        return (state === 'eventType') &&
                $state.includes('eventTypes');
    }

    function toggleNavSearch() {
        vm.isSearching = true;

        searcherCollections.preLoadSomeGimmes();

        $timeout(function () {
            $('#navSearch').focus();
        }, 200);

        googleAnalytics.trackEvent('Global Nav Search', 'Global nav search was toggled');
    }

    function closeNavSearch() {
        vm.searchTerm = '';
        vm.isSearching = false;
    }


    function search(searchTerm) {
        searcher.search(searchTerm);
        googleAnalytics.trackEvent('Global Nav Search', 'Search was conducted', 'search term: ' + searchTerm);
    }

    function shouldShowNoResults() {
        return _.every(searcherCollections.collections, function (collection) {
            return !collection.results || !collection.results.length;
        });
    }

    function getActiveBrowserName() {
        return window.bowser.name;
    }

    function isDotDotDotActive() {
        return $state.current.data && $state.current.data.isInDotDotDotMenu;
    }

    function shouldShowDotDotDotMenu() {
        return vm.canViewProfiles || vm.canViewUsers || vm.canViewPartners || vm.canViewCronJobs;
    }

    $scope.$on('$stateChangeSuccess', function () {
        closeNavSearch();
    });

    hotkeys.add({
        combo: 'shift shift',
        description: 'Toggle global search',
        allowIn: ['SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            if (wwtFocusPanelSVC.isAnyPanelOpen()) {
                return;
            }

            googleAnalytics.trackEvent('Global Nav Search', 'Global nav search was toggled from hotkey');
            event.preventDefault();
            toggleNavSearch();
        }
    });

    hotkeys.add({
        combo: 'esc',
        description: 'Clear global search',
        allowIn: ['INPUT'],
        callback: function (event, hotkey) {
            event.preventDefault();
            closeNavSearch();
        }
    });

});
