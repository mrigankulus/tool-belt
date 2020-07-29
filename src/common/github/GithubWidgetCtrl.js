appModule.controller('GithubWidgetCtrl', makeGithubWidgetCtrl);

function makeGithubWidgetCtrl($scope, githubAPI, assetState, $timeout) {
    var vm = this;

    vm.getOpenIssuesUrl = getOpenIssuesUrl;
    vm.getOpenPullsUrl = getOpenPullsUrl;
    vm.getOpenIssuesCount = getOpenIssuesCount;
    vm.getOpenPullsCount = getOpenPullsCount;
    vm.onRepoConnected = onRepoConnected;
    vm.onCancel = onCancel;
    vm.isReadonly = isReadonly;

    $scope.$watch('repo', init);

    function init() {

        if (!$scope.org || !$scope.repo) {
            return false;
        }

        githubAPI.getRepo($scope.org, $scope.repo).then(function (response) {
            vm.repo = response.data;
            vm.isLoadingGitHubCounts = true;

            githubAPI.getRepoOpenIssues($scope.org, $scope.repo).then(function (issuesResponse) {
                vm.repo.issues = issuesResponse.data;
            });

            githubAPI.getRepoOpenPRs($scope.org, $scope.repo).then(function (pullsResponse) {
                vm.repo.pulls = pullsResponse.data;
            });

            $timeout(function () {
                vm.isLoadingGitHubCounts = false;
            }, 150);
        }).catch(function (err) {
            vm.hasError = true;
        });

    }

    function isReadonly() {
        return $scope.readonly;
    }

    function getOpenIssuesUrl() {
        if (!vm.repo) {
            return false;
        }

        return vm.repo.html_url + '/issues?q=is%3Aopen+is%3Aissue';
    }

    function getOpenPullsUrl(repo) {
        if (!vm.repo) {
            return false;
        }

        return vm.repo.html_url + '/pulls?q=is%3Aopen+is%3Apr';
    }

    function getOpenIssuesCount(repo) {
        if (!vm.repo || !vm.repo.issues) {
            return;
        }

        var issuesCount = vm.repo.issues.filter(function (issue) {
            return !issue.pull_request;
        }).length;

        // if the results are paginated, we'll just show
        // "30+" to keep are requests simple.
        return issuesCount === 30 ? '30+' : issuesCount;
    }

    function getOpenPullsCount(repo) {
        if (!vm.repo || !vm.repo.pulls) {
            return;
        }

        var pullCount = vm.repo.pulls.length;

        // if the results are paginated, we'll just show
        // "30+" to keep are requests simple.
        return pullCount === 30 ? '30+' : pullCount;
    }

    function onRepoConnected(repo, orginalRepo) {
        var connectedRepos = assetState.currentAsset.connectedRepos;

        var newRepo = {
            org: repo.owner.login,
            repo: repo.name
        };

        if (orginalRepo) {
            var targetRepo = _.find(connectedRepos, {repo: orginalRepo.repo});
            // set it to the new repo
            targetRepo.org = newRepo.org;
            targetRepo.repo = newRepo.repo;
            targetRepo.isEditing = false;
        } else {
            connectedRepos.push(newRepo);
        }

        vm.repo.isEditing = false;
        assetState.currentAsset.update();
    }

    function onCancel(repo) {
        vm.repo.isEditing = false;
    }
}