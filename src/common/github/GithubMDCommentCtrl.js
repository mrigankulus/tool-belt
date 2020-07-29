appModule.controller('GithubMDCommentCtrl', makeGithubMDCommentCtrl);

function makeGithubMDCommentCtrl($scope, githubAPI) {
    var vm = this;

    init();

    function init() {
        if (!$scope.comment) {
            return;
        }

        githubAPI.processMarkdown($scope.comment).then(function (response) {
            vm.formattedComment = response.data;
        });
    }
}