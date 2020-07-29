appModule.controller('ManagePermissionsCtrl', makeManagePermissionsCtrl);

function makeManagePermissionsCtrl($scope, appsAPI) {
    var vm = this;

    vm.newPermission = {};
    vm.newPermissionIsValid = newPermissionIsValid;
    vm.createPermissionForRole = createPermissionForRole;
    vm.updatePermission = updatePermission;
    vm.removePermissionFromRole = removePermissionFromRole;
    vm.confirmDelete = confirmDelete;
    vm.promptToDeletPermission = promptToDeletPermission;
    vm.permissionAlreadyExists = permissionAlreadyExists;

    var appId = $scope.ApplicationPermissions.appId;

    function newPermissionIsValid() {
        return vm.newPermission.name && !permissionAlreadyExists(vm.newPermission);
    }

    function permissionAlreadyExists(permission) {
        return _.find($scope.ApplicationPermissions.allPermissions, {'name': permission.name});
    }

    function createPermissionForRole(role) {
        if (!role) {
            return;
        }

        role.isSavingNewPermission = true;

        // API requires a description, but we're not currently using it.
        vm.newPermission.description = vm.newPermission.name;

        appsAPI.createPermissionForApp(appId, vm.newPermission).then(function (newPermissionRepsonse) {
            var newPermission = newPermissionRepsonse.data;

            appsAPI.createPermissionAssociationForRole(appId, role, newPermission).then(function () {
                role.isSavingNewPermission = false;
                role.isAddingPermission = false;
                vm.newPermission = {};

                if (!role.permissions) {
                    // we may have just created the role
                    role.permissions = [];
                }

                // NOTE! we're not pushing the new permission association onto roles here. We
                // want the permission itself.
                role.permissions.push(newPermission);

                // push to all roles so we can inform the user that it is orphaned if
                // it is removed from a role before screen refresh.
                if (!$scope.ApplicationPermissions.allPermissions || !$scope.ApplicationPermissions.allPermissions.length) {
                    $scope.ApplicationPermissions.allPermissions = [];
                }

                $scope.ApplicationPermissions.allPermissions.push(newPermission);
            });
        });
    }

    function confirmDelete(role) {
        $scope.ApplicationPermissions.deletePermission(role.isPromptingToDelete).then(function () {
            role.isPromptingToDelete = false;
        });
    }

    function promptToDeletPermission(role, permission) {
        role.isPromptingToDelete = permission;
    }

    function updatePermission(permission) {
        permission.isSaving = true;

        // API requires a description, but we're not currently using it.
        permission.description = permission.name;

        return appsAPI.updatePermission(appId.id, permission).then(function () {
            // update this permission on other roles.
            $scope.ApplicationPermissions.roles.forEach(function (role) {
                var matchingPermission = _.find(role.permissions, {'id': permission.id})
                if (matchingPermission) {
                    matchingPermission.name = permission.name;
                    matchingPermission.description = permission.description;
                }
            });

            var matchingPermission = _.find($scope.ApplicationPermissions.allPermissions, {'id': permission.id})

            if (matchingPermission) {
                matchingPermission.name = permission.name;
                matchingPermission.description = permission.description;
            }

            permission.isSaving = false;
            permission.isEditing = false;
        });
    }

    function removePermissionFromRole(role, permission) {
        _.remove(role.permissions, {'id': permission.id});

        return appsAPI.deletePermissionAssociation(appId, role, permission);
    }
}