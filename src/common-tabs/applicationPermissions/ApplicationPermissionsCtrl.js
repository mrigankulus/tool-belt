appModule.controller('ApplicationPermissionsCtrl', makeApplicationPermissionsCtrl);

function makeApplicationPermissionsCtrl($scope, $stateParams, $state, appsAPI, apisAPI, assetState, $timeout, draggableCurrentlyDragging, userPermissionsAPI) {
    var vm = this;

    vm.appId = '';
    vm.newRole = {};
    vm.getAppName = getAppName;
    vm.openNewRoleForm = openNewRoleForm;
    vm.createRole = createRole;
    vm.confirmDeleteRole = confirmDeleteRole;
    vm.updateRole = updateRole;
    vm.hasOrphanedPermissions = hasOrphanedPermissions;
    vm.isOrphanedPermission = isOrphanedPermission;
    vm.deletePermission = deletePermission;
    vm.newRoleIsValid = newRoleIsValid;
    vm.isViewingHowTo = isViewingHowTo;
    vm.canDropOnRole = canDropOnRole;
    vm.onDropPermission = onDropPermission;
    vm.openAppLinkForm = openAppLinkForm;
    vm.setCanEditPermissions = setCanEditPermissions;

    // expose init on vm so it's available from child controllers
    vm.init = init;

    $scope.assetState = assetState;

    init();

    function init() {
        vm.pageIsReady = false;

        if ($state.includes('apiDetail')) {

            setCanEditPermissions('api');

            getMaskedApplication().then(function (response) {
                vm.pageIsReady = true;

                if (!response) {
                    openAppLinkForm();
                    return;
                }

                vm.appId = response.id;
                vm.maskedApplication = response;
                loadPermissions();
            });
        } else {
            vm.appId = $stateParams.id;
            vm.pageIsReady = true;
            setCanEditPermissions('application');
            loadPermissions();
        }
    }

    function setCanEditPermissions(assetType) {
        vm.permissionsHaveLoaded = false;

        if (assetType === 'application') {
            userPermissionsAPI.canApplyProfiles().then(function (response) {
                vm.canEditPermissions = response;
                vm.permissionsHaveLoaded = true;
            });
        } else {
            userPermissionsAPI.canEditApis().then(function (response) {
                vm.canEditPermissions = response;
                vm.permissionsHaveLoaded = true;
            });
        }
    }

    function getAppName() {
        if (assetState.currentAsset.appName) {
            return assetState.currentAsset.appName;
        }

        if (vm.maskedApplication) {
            return vm.maskedApplication.appName;
        }
    }

    function loadPermissions() {
        userPermissionsAPI.isDeveloper().then(function (devPerimssionsResponse) {
            vm.isDeveloper = devPerimssionsResponse;

            appsAPI.getRolesForApp(vm.appId).then(function (response) {
                vm.roles = response.data || [];

                vm.roles.forEach(function (it) {
                    it.isLoadingPermissions = true;

                    if (!vm.isDeveloper) {
                        it.isViewingProfiles = true
                    }

                    appsAPI.getPermissionsForRole(vm.appId, it.id).then(function (permissionsResponse) {
                        it.permissions = permissionsResponse.data;

                        $timeout(function () {
                            it.isLoadingPermissions = false;
                        }, 200);
                    });
                });
            });

        });

        appsAPI.getPermissionsForApp(vm.appId).then(function (response) {
            vm.allPermissions = response.data;
        });

        appsAPI.getPermittedUsersForApp(vm.appId).then(function (response) {
            vm.users = response.data;
        });

        appsAPI.getPermittedCustomersForApp(vm.appId).then(function (response) {
            vm.customers = response.data;
        });

        appsAPI.getAllProfiles().then(function (response) {
            vm.allProfiles = response.data;
        });
    }

    function openAppLinkForm() {
        $state.go('^.maskedApplication');
    }

    function getMaskedApplication() {
        return apisAPI.getApiById($stateParams.id).then(function (apiResponse) {
            var api = apiResponse.data;

            if (!api.maskedApplicationId) {
                return false;
            }

            return appsAPI.getAppById(api.maskedApplicationId).then(function (response) {
                return response.data;
            }).catch(function (err) {
                return '';
            });
        });
    }

    function openNewRoleForm() {
        var targetState = $state.includes('apiDetail') ? 'apiDetail.permissions.manage' : 'applicationDetail.permissions.manage';
        if (!$state.is(targetState)) {
            $state.go(targetState);
        }

        vm.isAddingRole = true;
    }

    function updateRole(role) {
        role.isSavingRoleUpdate = true;

        appsAPI.updateRole(vm.appId, role).then(function () {
            role.isSavingRoleUpdate = false;
            role.isEditing = false;
        });
    }

    function confirmDeleteRole(role) {
        return appsAPI.deleteRole(vm.appId, role).then(function (response) {
            _.remove(vm.roles, {'id': role.id});
            return response;
        });
    }

    function canDropOnRole(role) {
        var draggingPermission = draggableCurrentlyDragging.currentlyDraggingData;

        if (!draggingPermission || !draggingPermission.id) {
            return;
        }

        return !_.find(role.permissions, {'id': draggingPermission.id});
    }

    function onDropPermission($data, $event, role) {
        var permission = $data['json/custom-object'];

        if (_.find(role.permissions, {'id': permission.id})) {
            return;
        }

        associatePermissionToRole(role, permission);
    }

    function associatePermissionToRole(role, permission) {
        return appsAPI.createPermissionAssociationForRole(vm.appId, role, permission).then(function (response) {
            if (!role.permissions) {
                // we may have just created the role
                role.permissions = [];
            }

            role.permissions.push(response.data);
        });
    }

    function deletePermission(permissionAssociation) {
        // need to get the permission so we can update that instead of the permissionAssociation.
        // todo: can't quite tell if this is necessary. the association seems to be the same as
        // the permission, but I think it's suppose to be different?
        return appsAPI.getPermissionsForApp(vm.appId).then(function (response) {
            if (!response.data) {
                return;
            }

            var permission = _.find(response.data, {'name': permissionAssociation.name});

            $scope.ApplicationPermissions.roles.forEach(function (role) {
                _.remove(role.permissions, {'id': permission.id});
            });

            _.remove($scope.ApplicationPermissions.allPermissions, {'id': permission.id});

            appsAPI.deletePermission(vm.appId, permission);
            return;
        });
    }

    function createRole() {
        vm.isSavingNewRole = true;

        appsAPI.createRoleForApp(vm.appId, vm.newRole).then(function (response) {
            vm.isSavingNewRole = false;
            vm.isAddingRole = false;
            vm.newRole = {};
            vm.roles.push(response.data);
        });
    }

    function newRoleIsValid() {
        return vm.newRole.name && vm.newRole.description;
    }

    function hasOrphanedPermissions() {
        return (vm.allPermissions && vm.allPermissions.length) &&
            !_.filter(vm.roles, {'isLoadingPermissions': true}).length &&
            _.find(vm.allPermissions, isOrphanedPermission);
    }

    function isOrphanedPermission(permission) {
        return !_.find(vm.roles, function (role) {
            return _.find(role.permissions, {'id': permission.id});
        });
    }

    function isViewingHowTo() {
        return $state.is('applicationDetail.permissions.ui') ||
            $state.is('applicationDetail.permissions.grails') ||
            $state.is('applicationDetail.permissions.node');
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        var targetState = $state.includes('apiDetail') ? 'apiDetail.permissions' : 'applicationDetail.permissions';
        if (toState.name === targetState) {
            $state.go('.manage');
        }
    });
}
