appModule.controller('EventTypeComposeActionsCtrl', makeEventTypeComposeActionsCtrl);

function makeEventTypeComposeActionsCtrl($scope) {
    var vm = this;

    vm.saveAction = saveAction;
    vm.deleteAction = deleteAction;
    vm.isPrimaryLink = isPrimaryLink;

    $scope.$on('event-actions-bag.drop', $scope.EventTypeCompose.update);

    var defaultProperties = {
        largeScreenText: '-',
        httpMethod: 'LINK'
    }

    function saveAction(action) {
        var actions = $scope.EventTypeDetail.eventType.notificationActions ? $scope.EventTypeDetail.eventType.notificationActions : [];

        if (action.new) {
            delete action.new
            _.merge(action, defaultProperties)
            $scope.EventTypeDetail.eventType.notificationActions.push(action);
        }

        $scope.EventTypeCompose.update();

        $scope.EventTypeCompose.currentAction = '';
    }

    function deleteAction(action) {
        _.remove($scope.EventTypeDetail.eventType.notificationActions, {buttonText: action.buttonText});
        $scope.EventTypeCompose.currentAction = '';
        $scope.EventTypeCompose.update();
    }

    function isPrimaryLink(action) {
        var allLinks = _.filter($scope.EventTypeDetail.eventType.notificationActions, {httpMethod: 'LINK'});

        if (!allLinks || !allLinks[0]) {
            return;
        }

        return allLinks[0].buttonText === action.buttonText;
    }
}