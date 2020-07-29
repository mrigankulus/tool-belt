appModule.directive('userCard', function userCardDirective() {

    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'users/user-card/userCard.html',
        controller: 'UserCardCtrl',
        controllerAs: 'UserCard',
        replace: true,
        scope: {
            user: '='
        }
    };

});
