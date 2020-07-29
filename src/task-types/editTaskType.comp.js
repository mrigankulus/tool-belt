appModule.component('editTaskType', {
    templateUrl: 'task-types/editTaskType.html',
    controller: editTaskTypeCtrl,
    bindings: {
        taskType: '<'
    }
});

function editTaskTypeCtrl($state, TaskType, appsAPI, $timeout, messenger) {
    var vm = this

    vm.onSubmit = onSubmit
    vm.getIconNameForAppId = getIconNameForAppId
    vm.getAppNameForAppId = getAppNameForAppId
    vm.promptToDelete = promptToDelete

    init()

    function init() {
        appsAPI.getApps().then(function (response) {
            vm.apps = response.data
        });
    }

    function onSubmit() {
        if (!vm.taskType.id) {
            vm.isUpdating = true
            TaskType.create(vm.taskType).then(function (response) {
                vm.isUpdating = false
                $state.go('taskType', {id: response.data.id})
            })
        } else {
            vm.isUpdating = true
            vm.taskType.update().then(function () {
                vm.isUpdating = false
                vm.hasUpdated = true

                $timeout(function () {
                    vm.hasUpdated = false
                }, 500)
            })
        }
    }

    function getIconNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return
        }

        appId = parseInt(appId)

        var app = _.find(vm.apps, {id: appId})

        if (!app) {
            return
        }

        return app.iconName
    }

    function getAppNameForAppId(appId) {
        if (!appId || !vm.apps || !vm.apps.length) {
            return
        }

        appId = parseInt(appId)

        var app = _.find(vm.apps, {id: appId});

        if (!app) {
            return
        }

        return app.appName
    }

    function promptToDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to delete this task type?",
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
                    actionFunction: deleteTaskType
                }
            ]
        })
    }

    function deleteTaskType() {
        vm.taskType.delete().then(function () {
            $state.go('taskTypes')
            messenger.dismissMessage()
        })
    }

}
