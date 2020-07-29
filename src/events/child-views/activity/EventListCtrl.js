appModule.controller('EventListCtrl', makeEventListCtrl);

function makeEventListCtrl($q, $stateParams, $timeout, resourcesAPI, notificationsAPI) {
    var vm = this;

    vm.getAffectedUsersCount = getAffectedUsersCount;
    vm.getEmailSentCount = getEmailSentCount;
    vm.getEmailPooledCount = getEmailPooledCount;
    vm.getEmailFailedCount = getEmailFailedCount;
    vm.getEmailPendingCount = getEmailPendingCount;
    vm.getEventStatus = getEventStatus;
    vm.getResourceId = getResourceId;
    vm.getInAppSentCount = getInAppSentCount;
    vm.getReceipt = getReceipt;
    vm.goToNextPage = goToNextPage;

    init();

    function init() {
        vm.eventsHaveLoaded = false;
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        resourcesAPI.getMergedLogsForEventType($stateParams.id).then(function (response) {
            vm.nextPage = response.headers('next-page') || response.headers('Next-Page') || 0
            $timeout.cancel(loadTimer);
            vm.eventsHaveLoaded = true;
            vm.isLongLoad = false;
            vm.events = response.data;
        }).catch(function (err) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
        });
    }

    function goToNextPage() {
        vm.isLoadingNextPage = true
        resourcesAPI.getMergedLogsForEventType($stateParams.id, vm.nextPage).then(function (response) {
            vm.nextPage = response.headers('next-page') || response.headers('Next-Page') || 0
            vm.events = vm.events.concat(response.data);
            vm.isLoadingNextPage = false
        }).catch(function (err) {
            vm.isLoadingNextPage = false
        });
    }

    function getAffectedUsersCount(event) {
        var allRecipients = _.map(event.notificationRequests, function (it) {
            return _.map(it.recipients, function (recipient) {
                return recipient.userName;
            });
        });

        return allRecipients && allRecipients.length ? _.uniq(_.flattenDeep(allRecipients)).length : 0;
    }

    function getEmailSentCount(event) {
        return _.filter(event.notifications, function (it) {
            return it.method === 'email' && it.successful;
        }).length;
    }

    function getEmailPooledCount(event) {
        return _.filter(event.notifications, function (it) {
            return it.method === 'email' && !it.successful && _.get(it, 'digestSettings.shouldDigest');
        }).length;
    }

    function getInAppSentCount(event) {
        return _.filter(event.notifications, function (it) {
            return it.method === 'inApp';
        }).length;
    }

    function getEmailFailedCount(event) {
        return _.filter(event.notifications, function (it) {
            return it.method === 'email' && !it.successful && !_.get(it, 'digestSettings.shouldDigest');
        }).length;
    }

    function getEmailPendingCount(event) {
        // todo:
        return _.filter(event.notifications, function (it) {
            return it.method === 'email' && it.status === 'pending';
        }).length;
    }

    function getEventStatus(event) {
        if (getEmailFailedCount(event) || !event.notificationRequests) {
            return 'error';
        }

        if (getEmailPendingCount(event)) {
            return 'pending';
        }

        return 'success';
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