appModule.directive('countdown', countdownDirective);

function countdownDirective($interval) {

    var directive = {
        restrict: 'A',
        template: '{{ countdownText }}',
        scope: {
            date: '@'
        },
        link: link
    };

    function link(scope, element, attrs) {
        scope.countdownText = '';

        var interval = 1000;
        var eventDate = new Date(scope.date);
        var eventTime = eventDate.getTime();

        $interval(function () {
            var currentTime = Date.now();
            var diffTime = eventTime - currentTime;

            if (diffTime < 0) {
                scope.countdownText = 0;
                return;
            }

            var duration = moment.duration(diffTime, 'milliseconds');

            scope.countdownText = duration.hours() + 'h ' + duration.minutes() + 'm ' + duration.seconds() + 's';
        }, interval);

    }

    return directive;
}