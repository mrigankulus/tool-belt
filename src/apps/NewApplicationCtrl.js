appModule.controller('NewApplicationCtrl', makeNewApplicationCtrl);

function makeNewApplicationCtrl(appsAPI, $state, userPermissionsAPI) {
    var vm = this;

    // setting some defaults
    vm.application = {
        fixedUrlFlag: 'N',
        mobileEnabledFlag: 'N',
        showInNav: 'N',
        allInternalFlag: 'Y',
        allExternalFlag: 'N',
        defaultExternalApp: 'N',
        defaultInternalApp: 'N'
    };

    vm.createApplication = function () {
        vm.application.isWorking = true;

        // use appName for displayName
        vm.application.displayName = vm.application.appName;

        appsAPI.createApplication(vm.application).then(function (response) {
            $state.go('applicationDetail', {id: response.data.id});
            vm.application.isWorking = false;
        });
    };

    checkPermissions();

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

         userPermissionsAPI.canEditApps().then(function (response) {
            vm.canEditApps = response;
            vm.permissionsHaveLoaded = true;
        });
    }
}