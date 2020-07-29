appModule.controller('ProfileRolesCtrl', makeProfileRolesCtrl);

function makeProfileRolesCtrl($stateParams, appsAPI, $timeout) {
    var vm = this;

    init();

    function init() {
        vm.isLoadingRoles = true;
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        appsAPI.getRolesForProfile($stateParams.profileId).then(function (response) {
            vm.roles = response.data || [];

            appsAPI.getApps().then(function (response) {
                $timeout.cancel(loadTimer);
                vm.isLongLoad = false;

                vm.apps = response.data;
                // hydrate apps
                vm.roles.forEach(function (it) {
                    var matchingApp = _.find(vm.apps, {id: it.role.application.id});

                    if (!matchingApp) {
                        return;
                    }

                    it.role.application.iconName = matchingApp.iconName;
                });

                vm.isLoadingRoles = false;
            });
        });
    }
}