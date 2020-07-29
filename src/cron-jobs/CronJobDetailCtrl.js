appModule.controller('CronJobDetailCtrl', makeCronJobDetailCtrl);

function makeCronJobDetailCtrl(userPermissionsAPI, $timeout, cronJobsApi, $state, $scope, envExtended, messenger) {
    var vm = this;

    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.starterLimit = 10;
    vm.currentLimit = vm.starterLimit;
    vm.deleteJob = deleteJob;
    vm.updateJob = updateJob;
    vm.isHttps = isHttps;

    $scope.envExtended = envExtended;

    init();

    function init() {
        userPermissionsAPI.canViewCronJobs().then(function (response) {
            vm.canViewCronJobs = response;

            if (!vm.canViewCronJobs) {
                return;
            }

            var loadTimer = $timeout(function () {
                vm.isLongLoad = true;
            }, 700);


            cronJobsApi.getJob($state.params.id).then(function (response) {
                $timeout.cancel(loadTimer);
                vm.isLongLoad = false;
                vm.job = response.data;
            });
        });
    }

    function shouldShowShowMore() {
        return vm.job.history && (vm.job.history.length > vm.currentLimit);
    }

    function showMore() {
        vm.currentLimit += vm.starterLimit;
    }

    function updateJob() {
        if (isHttps()) {
            return
        }

        vm.isWorking = true;

        cronJobsApi.updateJob(vm.job).then(function (response) {
            vm.isWorking = false;
            vm.didJustSave = true;

            $timeout(function () {
                vm.didJustSave = false;
            }, 1000);
        });
    }

    function isHttps() {
        return _.includes(vm.job.url, 'https')
    }

    function deleteJob() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to delete this job?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        messenger.dismissMessage();
                    }
                },
                {
                    title: 'Delete',
                    mood: 'success',
                    actionFunction: onConfirmDelete
                }
            ]
        });
    }

    function onConfirmDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Deleting",
            "content": "",
            "isDismissable": false,
            "working": true
        });

        cronJobsApi.deleteJob(vm.job.id).then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Job Removed",
                "content": "",
                "isDismissable": false
            });

            $timeout(function () {
                $state.go('cronJobs');
            }, 500);

            $timeout(function () {
                messenger.dismissMessage();
            }, 1500);
        });
    }
}