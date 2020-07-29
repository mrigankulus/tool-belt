appModule.controller('ComponentScreenshotsCtrl', makeComponentScreenshotsCtrl);

function makeComponentScreenshotsCtrl($scope, userPermissionsAPI) {

    $scope.$watch('Component.component.id', init);

    function init() {
        if (!$scope.Component.component.id) {
            return false;
        }

        $scope.attachmentsSettings = {
            "readonly": true,
            "resourceTypeName": "ui-component",
            "resourceId": $scope.Component.component.id,
            "hideHeader": true,
            "eventData": $scope.Component.component
        };

        userPermissionsAPI.canEditComponents().then(function (response) {
            $scope.attachmentsSettings.readonly = !response;
        });
    }
}
