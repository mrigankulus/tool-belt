appModule.controller('RepoConnectCtrl', makeRepoConnectCtrl);

function makeRepoConnectCtrl($scope, githubAPI) {
    var vm = this;

    vm.connectedRepo = '';
    vm.newRepo = $scope.repo ? _.clone($scope.repo) : {};

    vm.connectRepo = connectRepo;
    vm.testConnection = testConnection;
    vm.onCancel = onCancel;
    vm.searchRepos = searchRepos;
    vm.onSelectedRepo = onSelectedRepo;

    init();

    function init() {
        if ($scope.repo && $scope.repo.repo) {
            searchRepos($scope.repo.repo).then(function (response) {
                vm.selectedRepo = {
                    owner: {login: $scope.repo.org },
                    name: $scope.repo.repo
                };
            });
        }
    }

    function connectRepo() {
        return testConnection().then(function (response) {
            vm.connectedRepo = response;
            // note that $scope.repo would be the original, given repo.
            // that will be useful for updating.
            $scope.onRepoConnected(response, $scope.repo);
        });
    }

    function testConnection() {
        vm.connectionSucceeded = false;

        return githubAPI.getRepo(vm.newRepo.org, vm.newRepo.repo).then(function (response) {
            vm.connectionSucceeded = true;
            return response.data;
        }, function () {
            vm.connectionSucceeded = false;
        });
    }

    function onCancel() {
        if ($scope.onCancel) {
            $scope.onCancel(vm.newRepo);
        }

        return;
    }

    function searchRepos(searchTerm) {
        if (!searchTerm) {
            return false;
        }

        return githubAPI.searchRepos(searchTerm).then(function (response) {
            vm.availableRepos = response.data.items;
            return vm.availableRepos;
        });
    }

    function onSelectedRepo(selctedRepo) {
        if (!selctedRepo) {
            vm.newRepo = {};
            return;
        }

        vm.newRepo.org = selctedRepo.owner.login;
        vm.newRepo.repo = selctedRepo.name;
    }
}
