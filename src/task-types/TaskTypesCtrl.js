appModule.controller('TaskTypesCtrl', makeTaskTypesCtrl)

function makeTaskTypesCtrl(userPermissionsAPI, TaskType, wwtFocusPanelSVC) {
    var vm = this

    vm.openNewTaskForm = openNewTaskForm

    init()

    function init() {
        userPermissionsAPI.canManageTaskTypes().then(function (response) {
            vm.canManageTaskTypes = response;

            if (!vm.canManageTaskTypes) {
                return;
            }

            getTaskTypes()
        })
    }

    function getTaskTypes() {
        TaskType.find().then(function (response) {
            vm.taskTypes = response.data
        })
    }

    function openNewTaskForm() {
        wwtFocusPanelSVC.togglePanel('newTaskTypeForm')
    }
}