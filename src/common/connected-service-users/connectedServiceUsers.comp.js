appModule.component('connectedServiceUsers', {
    templateUrl: 'common/connected-service-users/connectedServiceUsers.html',
    controller: connectedServiceUsersCtrl
})

function connectedServiceUsersCtrl(assetState) {
    const vm = this

    vm.connectUser = connectUser
    vm.onCancel = onCancel
    vm.removeUser = removeUser

    vm.$onInit = function () {
        vm.user = undefined
        vm.assetState = assetState
    }

    function onCancel() {
        vm.isAddingUser = false
        vm.user = undefined
    }

    function connectUser() {
        const connectedUsers = assetState.currentAsset.connectedServiceUsers
        const ind = findUserIndex(vm.user)

        if (ind < 0) {
            // user does not exist in our array yet, so add it
            connectedUsers.push(vm.user)
            vm.isAddingUser = false
            vm.user = undefined
            assetState.currentAsset.update()
        } else {
            // just close the form, we already have the user in our list
            onCancel()
        }
    }

    function removeUser(user) {
        const connectedUsers = assetState.currentAsset.connectedServiceUsers
        const ind = findUserIndex(user)

        if (ind >= 0) {
            connectedUsers.splice(ind, 1)
            assetState.currentAsset.update()
        }
    }

    function findUserIndex(user) {
        return assetState.currentAsset.connectedServiceUsers.findIndex(it => it.id === user.id)
    }
}
