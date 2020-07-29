appModule.controller('ApplicationScreenshotsCtrl', makeApplicationScreenshotsCtrl);

function makeApplicationScreenshotsCtrl($scope, appsAPI, $state, userPermissionsAPI) {

    var vm = this;

    vm.application = {};

    init();

    function init() {
        appsAPI.getAppById($state.params.id).then(function (response) {
            vm.application = response.data;

            $scope.attachmentsSettings = {
                "readonly": true,
                "resourceTypeName": "application",
                "resourceId": vm.application.id,
                "hideHeader": true,
                "eventData": vm.application
            };

            userPermissionsAPI.canEditApps().then(function (response) {
                $scope.attachmentsSettings.readonly = !response;
            });
        });
    }

}
