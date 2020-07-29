appModule.config(function ($stateProvider) {

    $stateProvider.state('cronJobs', {
        url: '/cron-jobs',
        templateUrl: 'cron-jobs/cronJobs.html',
        controller: 'CronJobsCtrl',
        controllerAs: 'CronJobs',
        data: {
            pageName: 'cron-jobs',
            browserTitle: 'Cron Jobs',
            isInDotDotDotMenu: true,
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewCronJobs'
        }
    });

    $stateProvider.state('cronJobDetail', {
        url: '/cron-jobs/:id',
        templateUrl: 'cron-jobs/cronJobDetail.html',
        controller: 'CronJobDetailCtrl',
        controllerAs: 'CronJobDetail',
        data: {
            pageName: 'cron-job',
            browserTitle: 'Cron Job',
            isInDotDotDotMenu: true,
            isSearchable: false
        }
    });

});
