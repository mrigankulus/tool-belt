appModule.controller('NewUserFormCtrl', makeNewUserFormCtrl)

function makeNewUserFormCtrl(usersAPI, $scope, $state) {
    var vm = this

    vm.createUser = createUser
    vm.onTypeChange = onTypeChange
    vm.cancelNewUser = cancelNewUser

    init()

    function init() {
        vm.newUser = {
            type: 'svc'
        };
    }

    function onTypeChange() {
        if (vm.newUser.type === 'proxy') {
            if (!vm.newUser.firstName) {
                vm.newUser.firstName = 'Proxy'
            }
        } else {
            if (vm.newUser.firstName === 'Proxy') {
                vm.newUser.firstName = ''
            }
        }
    }

    function createUser() {
        if (vm.newUser.type === 'svc' && vm.newUser.userName.toLowerCase().indexOf('svc_') !== 0) {
            vm.newUser.invalidUserName = true;
            return
        } else {
            vm.newUser.invalidUserName = false;
        }

        vm.isSavingNewUser = true;

        let userPost

        if (vm.newUser.type === 'svc') {
            userPost = formatNewSvcUser(vm.newUser)
        } else {
            userPost = formatNewProxyUser(vm.newUser)
        }

        usersAPI.addUser(userPost, false).then(response => {
            vm.isSavingNewUser = false
            vm.isAddingUser = false
            vm.newUser = {}
            $state.go('userDetail', {userName: response.data.userName})
        }).catch(err => {
            console.error(err)
        })
    }

    function formatNewSvcUser(newUser) {
        return {
            userName: newUser.userName,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            fullName: `${newUser.firstName} ${newUser.lastName}`,
            type: newUser.type,
            internal: false,
            email: null,
            resetPasswordRequired: false,
            enabled: true
        }
    }

    function formatNewProxyUser(newUser) {
        if (!newUser.firstName) {
            newUser.firstName = 'Proxy'
        }

        newUser.lastName = newUser.email

        return {
            userName: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            fullName: `${newUser.firstName} ${newUser.lastName}`,
            type: newUser.type,
            internal: true,
            email: newUser.email,
            resetPasswordRequired: false,
            enabled: true
        }
    }

    function cancelNewUser() {
        if ($scope.onCancelNewUser) {
            $scope.onCancelNewUser(vm.newUser)
        }
    }
}