appModule.controller('ProfileApplicationsCtrl', makeProfileApplicationsCtrl);

function makeProfileApplicationsCtrl(appsAPI, $stateParams) {
    var vm = this;

    init();

    function init() {
        vm.apps = [];

        appsAPI.getRolesForProfile($stateParams.profileId).then(function (response) {
            vm.roles = response.data || [];

            appsAPI.getApps().then(function (response) {
                var allApps = response.data;

                // hydrate apps
                vm.roles.forEach(function (it) {
                    var matchingApp = _.find(allApps, {id: it.role.application.id});
                    vm.apps.push(matchingApp);
                });

                console.log(vm.apps);
            });
        });
    }
}