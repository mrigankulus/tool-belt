appModule.directive('githubWidget', function jenkinsWidgetDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/github/githubWidget.html',
        controller: 'GithubWidgetCtrl',
        controllerAs: 'GithubWidget',
        scope: {
            readonly: '=',
            org: '=',
            repo: '='
        }
    };

});