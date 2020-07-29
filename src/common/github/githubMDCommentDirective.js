appModule.directive('githubMDComment', function githubMDCommentDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/github/githubMDComment.html',
        controller: 'GithubMDCommentCtrl',
        controllerAs: 'GithubMDComment',
        scope: {
            comment: '@'
        }
    };

});