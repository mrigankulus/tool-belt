appModule.controller('UserApplicationsCtrl', makeUserApplicationsCtrl);

function makeUserApplicationsCtrl($scope, appsAPI, usersAPI, $timeout) {
    var vm = this;

    vm.updateUserDefaultAppInUi = updateUserDefaultAppInUi;
    vm.updateUserPreferences = updateUserPreferences;
    vm.getIconNameForAppId = getIconNameForAppId;
    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.appsLimit = 24;

    $scope.$watch('UserDetail.user', init);

    function init() {
        if (!$scope.UserDetail.user) {
            return;
        }

        vm.dataLoaded = false;
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        appsAPI.getAppsForUserId($scope.UserDetail.user.wwtUserId).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.userApps = response.data;
            vm.dataLoaded = true;
        });

        appsAPI.getApps().then(function (response) {
            vm.apps = response.data;

            usersAPI.getDefaultAppByUser($scope.UserDetail.user).then(function (response) {
                vm.userPreferences = response.data;

                if (!_.get(vm.userPreferences, 'defaultApplication.id')) {
                    return
                }

                vm.defaultApp = _.find(vm.apps, function (app) {
                    return app.id === vm.userPreferences.defaultApplication.id
                });
            });

        });
    }

    function updateUserPreferences() {
        if (vm.userPreferences.id == null && (vm.userPreferences.defaultApplication.id == vm.defaultApp.id)) {
            return;
        }

        var updatedUserDefaults = {
            defaultApplication: {
                id: vm.userPreferences.defaultApplication.id
            },
            user: {
                id: $scope.UserDetail.user.id
            }
        };

        _.merge(vm.userPreferences, updatedUserDefaults);

        usersAPI.updateUserPreferences(vm.userPreferences);
    }

    function updateUserDefaultAppInUi(selectedApp) {
        vm.userPreferences.defaultApplication = selectedApp;

        updateUserPreferences();
    }

    function getIconNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return;
        }

        appId = parseInt(appId);

        var app = _.find(vm.apps, {id: appId});

        if (!app) {
            return;
        }

        return app.iconName;
    }

    function shouldShowShowMore() {
        return vm.userApps && !vm.appSearchText && (vm.userApps.length > vm.appsLimit);
    }

    function showMore() {
        vm.appsLimit += vm.userApps.length;
    }
}
