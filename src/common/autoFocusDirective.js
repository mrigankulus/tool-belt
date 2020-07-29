function autoFocusDirective($timeout) {

    var directive = {
        restrict: 'A',
        link: link
    };

    function link(scope, element, attrs) {

        $(element).click(function () {

            $timeout(function () {
                $(attrs.autoFocus).focus().select();
            }, 300);

        });
    }

    return directive;
}

appModule.directive('autoFocus', autoFocusDirective);