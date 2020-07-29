appModule.controller('CronJobsCtrl', makeCronJobsCtrl);

function makeCronJobsCtrl(userPermissionsAPI, $timeout, cronJobsApi, $state, wwtFocusPanelSVC, $scope, envExtended, messenger) {
    var vm = this;

    vm.createJob = createJob;
    vm.formIsValid = formIsValid;
    vm.onIdChange = onIdChange;
    vm.starterCount = 24
    vm.currentCount = vm.starterCount
    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.isHttps = isHttps

    vm.newJob = {
        method: 'POST'
    };

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;
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


            cronJobsApi.getJobs().then(function (response) {
                $timeout.cancel(loadTimer);
                vm.isLongLoad = false;
                vm.jobs = response.data;
            });
        });
    }

    function formIsValid() {
        return vm.newJob.id &&
                vm.newJob.schedule &&
                vm.newJob.method &&
                vm.newJob.url &&
                !isHttps()
    }

    function isHttps() {
        return _.includes(vm.newJob.url, 'https')
    }

    function createJob() {
        if (!formIsValid()) {
            return;
        }

        cronJobsApi.updateJob(vm.newJob).then(function (response) {
            wwtFocusPanelSVC.togglePanel('newCronJobForm');
            vm.newJob = {};

            messenger.showMessage({
                "type": "success",
                "title": "Job Created!",
                "content": "Your job has been queued. Please refresh your browser and your job should show up here shortly.",
                "isDismissable": true
            });

        });
    }

    function onIdChange() {
        if (!vm.newJob || !vm.newJob.id) {
            return;
        }

        vm.newJob.id = slugifyText(vm.newJob.id);
        validateId();
    }

    function slugifyText(text) {
        // todo: not sure if we should validate this or now?
        return text;

        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    function validateId() {
        vm.idAlreadyExists = false;

        if (!vm.newJob || !vm.newJob.id || !vm.jobs || !vm.jobs.length) {
            vm.idAlreadyExists = false;
            return;
        }

        vm.isValidatingId = true;

        if (_.find(vm.jobs, {id: vm.newJob.id})) {
            vm.idAlreadyExists = true;
        }
    }

    function shouldShowShowMore() {
        if (vm.jobsSearchText) {
            return
        }

        return vm.jobs && (vm.jobs.length > vm.currentCount);
    }

    function showMore() {
        vm.currentCount += vm.starterCount;
    }
}