appModule.controller('ConnectedItemsListCtrl', makeConnectedItemsListCtrl);

function makeConnectedItemsListCtrl($scope, assetState) {
    var vm = this;

    vm.onRepoConnected = onRepoConnected;
    vm.onCancel = onCancel;
    vm.removeRepo = removeRepo;

    vm.onVisionBoardConnected = onVisionBoardConnected;
    vm.onCancelAddingVisionBoard = onCancelAddingVisionBoard;
    vm.removeVisionBoard = removeVisionBoard;

    vm.onCancelJenkinsJob = onCancelJenkinsJob;
    vm.onJenkinsJobConnected = onJenkinsJobConnected;
    vm.removeJenkinsJob = removeJenkinsJob;

    vm.newJob = {};

    $scope.assetState = assetState;

    $scope.$on('repos-bag.drop', onSortDrop);

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

        vm.isAddingRepo = false;
        assetState.currentAsset.update();
    }

    function onSortDrop() {
        assetState.currentAsset.update();
    }


    function onCancel(repo) {
        assetState.currentAsset.connectedRepos.forEach(function (it) {
            it.isEditing = false;
        });

        vm.isAddingRepo = false;
    }

    function removeRepo(repo) {
        _.remove(assetState.currentAsset.connectedRepos, function (it) {
            return it.repo === repo.repo;
        });

        assetState.currentAsset.update();
    }

    function onVisionBoardConnected(board, orginalBoard) {
        var connectedBoards = assetState.currentAsset.connectedVisionBoards;

        var newBoard = {
            id: board.id,
            name: board.name
        };

        if (orginalBoard) {
            var targetBoard = _.find(connectedBoards, {id: orginalBoard.id});

            targetBoard.id = newBoard.id;
            targetBoard.name = newBoard.name;
            targetBoard.isEditing = false;
        } else {
            connectedBoards.push(newBoard);
        }

        vm.isAddingVisionBoard = false;
        assetState.currentAsset.update();
    }


    function removeVisionBoard(board) {
        _.remove(assetState.currentAsset.connectedVisionBoards, function (it) {
            return it.id === board.id;
        });

        assetState.currentAsset.update();
    }

    function onCancelAddingVisionBoard(board) {
        assetState.currentAsset.connectedVisionBoards.forEach(function (it) {
            it.isEditing = false;
        });

        vm.isAddingVisionBoard = false;
    }

    function onJenkinsJobConnected(job, originalJob) {
        var connectedJobs = assetState.currentAsset.connectedJenkinsJobs;

        var newJob = {
            name: job.name
        };

        if (originalJob) {
            var targetJob = _.find(connectedJobs, {name: originalJob.name});

            targetJob.name = newJob.name;
            targetJob.isEditing = false;
        } else {
            connectedJobs.push(newJob);
        }

        vm.isAddingJenkinsJob = false;
        assetState.currentAsset.update();
    }

    function onCancelJenkinsJob() {
        assetState.currentAsset.connectedJenkinsJobs.forEach(function (it) {
            it.isEditing = false;
        });

        vm.isAddingJenkinsJob = false;
    }

    function removeJenkinsJob(job) {
        _.remove(assetState.currentAsset.connectedJenkinsJobs, function (it) {
            return it.name === job.name;
        });

        assetState.currentAsset.update();
    }
}
