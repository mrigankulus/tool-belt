appModule.controller('EventTypeSubscriptionsCtrl', makeEventTypeSubscriptionsCtrl);

function makeEventTypeSubscriptionsCtrl($scope, notificationsAPI, wwtFocusPanelSVC, $timeout) {
    var vm = this;

    vm.subscribeUser = subscribeUser;
    vm.onSelectUserFromTypeAhead = onSelectUserFromTypeAhead;
    vm.onSearch = onSearch
    vm.nextPage = nextPage
    vm.updateSettings = updateSettings

    vm.newUser = '';

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC
    $scope.$watch('EventTypeDetail.eventType', init, true);

    function init() {
        if (!$scope.EventTypeDetail.eventType) {
            return;
        }

        vm.subscribersHaveLoaded = false;

        getSubscriptions()
    }

    function onSearch(searchTerm) {
        vm.isSearching = true

        vm.query.page = 1

        if (!searchTerm) {
            delete vm.query.searchTerm
            return getSubscriptions().then(function () {
                vm.isSearching = false
                return
            })
        }

        vm.query.searchTerm = searchTerm

        return getSubscriptions().then(function () {
            vm.isSearching = false
            return
        })
    }

    function nextPage() {
        vm.query.page++
        vm.subscribersHaveLoaded = false
        getSubscriptions().then(function () {
            vm.subscribersHaveLoaded = true
        })
    }

    function getSubscriptions() {
        if (!vm.query) {
            vm.query = {
                pageSize: 99,
                page: 1
            }
        }
        return notificationsAPI.getSubscribersForEventType($scope.EventTypeDetail.eventType, vm.query).then(function (response) {
            vm.subscribers = response.data;
            vm.subscribersHaveLoaded = true;
            return response.data
        });
    }

    function subscribeUser() {
        vm.isSavingSubscriber = true;

        notificationsAPI.subscribeUserToEventType($scope.EventTypeDetail.eventType, vm.newUser.wwtUserId).then(function (response) {
            vm.subscribers.push(response.data);
            vm.isAddingSubscriber = false;
            vm.isSavingSubscriber = false;
        });
    }

    function onSelectUserFromTypeAhead(user) {
        vm.newUser = user;
    }

    function updateSettings() {
        $scope.EventTypeDetail.update()
        $timeout(function () {
            wwtFocusPanelSVC.togglePanel('subscriptionSettingsForm')
        }, 300)
    }
}