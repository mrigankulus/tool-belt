appModule.directive('tokenSupportedMessage', tokenSupportedMessageDirective);

function tokenSupportedMessageDirective() {
    return {
        restrict: 'E',
        scope: {
            tooltipPlacement: '@'
        },
        template: '<div class="token-supported-message"' +
                        'uib-tooltip="This field supports tokens by typing curly braces."' +
                        'tooltip-placement="{{ tooltipPlacement || \'top\' }}"' +
                        'tooltip-append-to-body="true"' +
                        'tooltip-popup-delay="300">{{</div>'
    };
}