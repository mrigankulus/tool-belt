appModule.controller('EventTypeActivityCtrl', makeEventTypeActivityCtrl);

function makeEventTypeActivityCtrl($scope, $state) {

    init()

    function init() {
        if ($state.is('eventTypeDetail.activity')) {
            $state.go('.activityList')
        }
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'eventTypeDetail.activity') {
            $state.go('.activityList')
        }
    });
}