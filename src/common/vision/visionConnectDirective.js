appModule.directive('visionConnect', function visionConnectDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/vision/visionConnect.html',
        controller: 'VisionConnectCtrl',
        controllerAs: 'VisionConnect',
        scope: {
            onBoardConnected: '=',
            onCancelBoard: '=',
            inline: '=',
            name: '=',
            id: '=',
            board: '='
        }
    };

});
