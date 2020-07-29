appModule.directive('ignoreMouseWheel', function($document) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element.bind('mousewheel', function(event) {
                var scrollAmount = event.originalEvent.wheelDelta * -1 + $document.scrollTop();
                event.preventDefault();
                $document.scrollTop(scrollAmount);
            });
        }
    }
});