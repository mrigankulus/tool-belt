appModule.directive('newUserForm', newUserFormDirective);

function newUserFormDirective() {
    return {
        restrict: 'E',
        templateUrl: 'users/new-user/newUserForm.html',
        controller: 'NewUserFormCtrl',
        controllerAs: 'NewUserForm',
        replace: true,
        scope: {
            onCancelNewUser: '='
        }
    }
}