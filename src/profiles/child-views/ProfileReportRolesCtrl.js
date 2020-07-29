appModule.controller('ProfileReportRolesCtrl', makeprofileReportRolesCtrl)

function makeprofileReportRolesCtrl(reportRolesApi, $state, $scope) {
    var vm = this

    vm.addReportRole = addReportRole
    vm.shouldShowBlankSlate = shouldShowBlankSlate
    vm.removeRoleFromProfile = removeRoleFromProfile
    vm.choiceIsDisabled = choiceIsDisabled

    init()

    function init() {
        vm.isLoading = true

        reportRolesApi.getAllReportRoles().then(function (response) {
            vm.availableRoles = response.data
        })

        reportRolesApi.getRolesForProfileId($state.params.profileId).then(function (response) {
            vm.roles = response.data
            vm.isLoading = false
        })
    }

    function shouldShowBlankSlate() {
        return !vm.isLoading && !_.size(vm.roles)
    }

    function addReportRole() {
        vm.isSaving = true

        reportRolesApi.addReportRoleToProfile($scope.ProfileDetail.profile, vm.newRole).then(function (response) {
            vm.roles.push(response.data)
            vm.newRole = ''
            vm.isAdding = false
            vm.isSaving = false
        })
    }

    function removeRoleFromProfile(roleAssociation) {
        _.remove(vm.roles, {id: roleAssociation.id})
        reportRolesApi.removeRoleFromProfile($scope.ProfileDetail.profile, roleAssociation)
    }

    function choiceIsDisabled(choice) {
        return _.find(vm.roles, function (it) {
            return it.reportRoleId === choice.id
        })
    }
}