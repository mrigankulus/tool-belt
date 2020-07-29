appModule.directive('jenkinsWidget', function jenkinsWidgetDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/jenkins/jenkinsWidget.html',
        controller: 'JenkinsWidgetCtrl',
        controllerAs: 'JenkinsWidget'
    };

});