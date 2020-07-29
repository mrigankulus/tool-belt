appModule.controller('EventsHowToCtrl', makeEventsHowToCtrl);

function makeEventsHowToCtrl(githubAPI, $state, $scope) {
    var vm = this;

    $scope.$state = $state;

    vm.isOnGeneralTab = isOnGeneralTab;

    init();

    function init() {

        if ($state.is('eventTypes.howTo')) {
            $state.go('.general');
        }

        vm.isLoadingReadme = true;
        var filePath;

        if ($state.is('eventTypes.howTo.grails')) {
            filePath = 'grailsNotificationInstructions.md';
        } else if ($state.is('eventTypes.howTo.node')) {
            filePath = 'nodeNotificationInstructions.md';
        } else if ($state.is('eventTypes.howTo')) {
            filePath = 'README.md';
        }

        if (!filePath) {
            vm.readme = false;
            return;
        }

        githubAPI.getAndDecodeFile('custom-apps', 'notifications-api', filePath).then(function (response) {
            vm.readme = response;
            vm.isLoadingReadme = false;
        });
    }

    function isOnGeneralTab() {
        return $state.is('eventTypes.howTo.general');
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        init();
    });
}