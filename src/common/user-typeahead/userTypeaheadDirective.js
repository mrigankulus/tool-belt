appModule.directive('userTypeahead', function userTypeaheadDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/user-typeahead/userTypeahead.html',
        controller: 'UserTypeaheadCtrl',
        controllerAs: 'UserTypeahead',
        scope: {
            targetModelParent: '=',
            onSelectUser: '=',
            placeholder: '=',
            getShouldDisableUserSelectionReason: '='
        }
    };

});
