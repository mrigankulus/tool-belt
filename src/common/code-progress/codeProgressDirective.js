appModule.directive('codeProgress', codeProgressDirective);

function codeProgressDirective(assetState) {
    var template = '<div class="code-progress" style="{{getFontSize()}}">' +
                      '<span>{</span><span>}</span>' +
                    '</div>';

    return {
        restrict: 'E',
        template: template,
        scope: {
            fontSize: '='
        },
        link: link
    };

    function link($scope) {
        $scope.getFontSize = function () {
            if (!$scope.fontSize) {
                return 'font-size: 60px';
            }

            return 'font-size: ' + $scope.fontSize;
        };
    }
}