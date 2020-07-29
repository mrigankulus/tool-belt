appModule.component('groupTypeForm', {
    templateUrl: 'groups/group-types/groupTypeForm.html',
    controller: GroupTypeFormCtrl,
    bindings: {
        groupType: '<',
        onCreate: '<',
        onUpdate: '<',
        onCancel: '<'
    }
});

function GroupTypeFormCtrl(GroupType, Group, $timeout, messenger, $state) {
    var vm = this

    vm.setIdFromTitle = setIdFromTitle
    vm.update = update
    vm.promptToDelete = promptToDelete
    vm.searchGroups = searchGroups
    vm.isReadonly = isReadonly

    init()

    function init() {
        if (!_.get(vm.groupType, 'id')) {
            vm.isNew = true
        }
    }

    function searchGroups(searchTerm) {
        if (!searchTerm) {
            return
        }

        Group.find({search: searchTerm, select: 'title'}).then(function (response) {
            vm.searchedGroups = response.data.docs
        })
    }

    function update() {
        if (!vm.groupType.name || !vm.groupType.name) {
            return
        }

        if (vm.isNew) {
            createGroupType()
        } else {
            updateGroupType()
        }
    }

    function isReadonly() {
        if (vm.isNew) return
        return !_.get(vm.groupType, '_callerRights.write')
    }

    function createGroupType() {
        vm.isWorking = true
        GroupType.create(vm.groupType).then(function (response) {
            vm.isWorking = false
            if (vm.onCreate) {
                vm.onCreate(new GroupType(response.data))
            }
        })
    }

    function updateGroupType() {
        vm.isWorking = true

        vm.groupType.update(vm.groupType).then(function () {
            vm.isWorking = false
            vm.isFinishedWorking = true

            $timeout(function () {
                vm.isFinishedWorking = false

                if (vm.onUpdate) {
                    vm.onUpdate(vm.groupType)
                }
            }, 1000)
        })
    }

    function setIdFromTitle() {
        if (!vm.isNew) {
            return
        }

        if (!_.get(vm.groupType, 'name')) {
            return
        }

        vm.groupType.id = _.kebabCase(vm.groupType.name)
    }

    function promptToDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Slow Down",
            "content": "Are you sure you'd like to delete this group type?",
            "isDismissable": false,
            customActions: [
                {
                    title: 'Cancel',
                    mood: 'cancel',
                    actionFunction: function () {
                        messenger.dismissMessage()
                    }
                },
                {
                    title: 'Delete',
                    mood: 'success',
                    actionFunction: onConfirmDelete
                }
            ]
        })
    }

    function onConfirmDelete() {
        messenger.showMessage({
            "type": "warning",
            "title": "Deleting",
            "content": "",
            "isDismissable": false,
            "working": true
        })

        vm.groupType.delete().then(function () {
            messenger.showMessage({
                "type": "success",
                "title": "Group Type Removed",
                "content": "",
                "isDismissable": false
            })

            $timeout(function () {
                $state.go('groups.groupTypes')
            }, 500)

            $timeout(function () {
                messenger.dismissMessage()
            }, 1500)
        })
    }
}