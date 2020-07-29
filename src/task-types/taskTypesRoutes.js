appModule.constant('taskTypeRoutes', function () {
    return [
        { slug: 'notifications', displayName: 'Notifications' },
        { slug: 'tasks', displayName: 'Tasks' },
        { slug: 'analytics', displayName: 'Analytics' },
        { slug: 'settings', displayName: 'Settings' }
    ];
});

appModule.config(function ($stateProvider, taskTypeRoutes) {

    $stateProvider.state('taskTypes', {
        url: '/task-types',
        templateUrl: 'task-types/taskTypes.html',
        controller: 'TaskTypesCtrl',
        controllerAs: 'TaskTypes',
        data: {
            pageName: 'task-types',
            browserTitle: 'Task Types',
            isInDotDotDotMenu: true,
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canManageTaskTypes'
        }
    });

    $stateProvider.state('taskType', {
        url: '/task-types/:id',
        templateUrl: 'task-types/taskType.html',
        controller: 'TaskTypeCtrl',
        controllerAs: 'TaskType',
        data: {
            pageName: 'task-type-detail',
            browserTitle: 'Task Type',
            isInDotDotDotMenu: true,
        }
    });

    taskTypeRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('taskType.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'task-types/child-views/taskType' + it.displayName + '.html',
            controller: 'TaskType' + it.displayName + 'Ctrl',
            controllerAs: '$ctrl',
            data: {
                pageName: 'task-type-' + it.slug,
                browserTitle: it.displayName,
                isInDotDotDotMenu: true
            }
        });

    });
});
