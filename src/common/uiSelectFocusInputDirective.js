// fix for ui-select not focusing properly
// https://github.com/angular-ui/ui-select/issues/1201
appModule.directive('uiSelectFocusInput', function($timeout){
    return {
        require: 'ui-select',
        link: function (scope, $element, $attributes, selectController) {

            scope.$on('uis:activate',function(){
                // Give it time to appear before focus
                $timeout(function(){
                    scope.$select.searchInput[0].focus();
                }, 200);
            });
        }
    }
});