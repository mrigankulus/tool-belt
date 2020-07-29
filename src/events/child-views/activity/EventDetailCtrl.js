appModule.controller('EventDetailCtrl', makeEventDetailCtrl);

function makeEventDetailCtrl(resourcesAPI, $timeout, $stateParams) {
    var vm = this;

    vm.getResourceId = getResourceId;

    init();

    function init() {
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        resourcesAPI.getEvent($stateParams.eventId).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.event = response.data;

            vm.receipt = getReceipt(vm.event);
        });
    }

    function getResourceId(event) {
        if (!event || !event.notificationRequests || !event.notificationRequests[0]) {
            return '';
        }

        return event.notificationRequests[0].resource.resourceId;
    }

    function getReceipt(event) {
        if (!event || !event.notificationRequests || !event.notificationRequests[0]) {
            return '';
        }

        var tagetRequest = _.find(event.notificationRequests, function (it) {
            return it.receipt;
        });

        if (!tagetRequest) {
            return '';
        }

        return tagetRequest.receipt;
    }
}