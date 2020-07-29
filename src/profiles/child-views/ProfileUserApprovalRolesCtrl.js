appModule.controller('ProfileUserApprovalRolesCtrl', makeProfileUserApprovalRolesCtrl)

function makeProfileUserApprovalRolesCtrl($state, userApprovalsApi, $scope) {
    var vm = this

    vm.addRole = addRole
    vm.removeRoleFromProfile = removeRoleFromProfile
    vm.shouldShowBlankSlate = shouldShowBlankSlate
    vm.choiceIsDisabled = choiceIsDisabled

    init()

    function init() {
        userApprovalsApi.getAllUserApprovalRoles().then(function (response) {
            vm.availableRoles = response.data
        })

        vm.isLoading = true

        userApprovalsApi.getUserApprovalRolesForProfileId($state.params.profileId).then(function (response) {
            vm.roles = response.data
            vm.isLoading = false
        })
    }

    function addRole() {
        vm.isSavingRole = true
        userApprovalsApi.addUserApprovalRoleToProfile($scope.ProfileDetail.profile, vm.selectedRole).then(function (response) {
            vm.roles.push(response.data)
            vm.selectedRole = ''
            vm.isAddingRole = false
            vm.isSavingRole = false
        })
    }

    function removeRoleFromProfile(association) {
        userApprovalsApi.removeUserApprovalRoleFromProfile($scope.ProfileDetail.profile, association)
        _.remove(vm.roles, function (it) {
            return association.id === it.id
        })
    }

    function shouldShowBlankSlate() {
        return !vm.isLoading && !_.size(vm.roles)
    }

    function choiceIsDisabled(choice) {
        return _.find(vm.roles, function (it) {
            return it.application + it.role === choice.application + choice.role
        })
    }
}