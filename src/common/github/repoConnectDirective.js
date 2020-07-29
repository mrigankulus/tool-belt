appModule.directive('repoConnect', function githubConnectFormDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/github/repoConnect.html',
        controller: 'RepoConnectCtrl',
        controllerAs: 'RepoConnect',
        scope: {
            onRepoConnected: '=',
            onCancel: '=',
            inline: '=',
            repo: '='
        }
    };

});
