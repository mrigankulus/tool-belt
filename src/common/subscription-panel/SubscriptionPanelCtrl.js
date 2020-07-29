appModule.controller('SubscriptionPanelCtrl', makeSubscriptionPanelCtrl);

function makeSubscriptionPanelCtrl($scope, $timeout, notificationsAPI) {
    var vm = this;

    vm.deleteSubscription = deleteSubscription;

    init();

    function init() {
        notificationsAPI.resourceTypeSubscription($scope.resourceType.id, $scope.subscriber.userName).then(function (response) {
            vm.subscription = response.data;
            $scope.$broadcast('force-wwt-scroll-trap-refresh', {instanceName: 'SubscriptionPanelScrollTrap'});
        });
    }

    function deleteSubscription(subscription) {
        vm.isWorking = true;
        vm.wasSuccessfullyDeleted = false;

        notificationsAPI.deleteResourceTypeSubscription($scope.resourceType.id, $scope.subscriber.userName).then(function () {
            vm.isWorking = false;
            vm.wasSuccessfullyDeleted = true;

            _.remove($scope.subscribers, {userName: $scope.subscriber.userName});

            $timeout(function () {
                vm.wasSuccessfullyDeleted = false;
                delete $scope.subscriber;
            }, 1000);
        });
    }
}