appModule.directive('visionWidget', function jenkinsWidgetDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/vision/visionWidget.html',
        controller: 'VisionWidgetCtrl',
        controllerAs: 'VisionWidget',
        scope: {
            groupId: '=',
            groupName: '='
        }
    };

});
