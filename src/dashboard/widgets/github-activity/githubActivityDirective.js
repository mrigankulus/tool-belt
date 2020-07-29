appModule.directive('githubActivity', function githubActivityDirective() {

    return {
        restrict: 'E',
        templateUrl: 'dashboard/widgets/github-activity/githubActivity.html',
        controller: 'GithubActivityCtrl',
        controllerAs: 'GithubActivity',
        scope: {
            org: '='
        }
    };

});