appModule.directive('serviceUserTypeahead', function serviceUserTypeaheadDirective() {

    return {
        restrict: 'E',
        templateUrl: 'common/service-user-typeahead/serviceUserTypeahead.html',
        controller: 'ServiceUserTypeaheadCtrl',
        controllerAs: '$ctrl',
        scope: {
            targetModelParent: '=',
            onSelectUser: '=',
            placeholder: '=',
            getShouldDisableUserSelectionReason: '='
        }
    }
})
