appModule.controller('ResourceTypeSubscriptionsCtrl', makeResourceTypeSubscriptionsCtrl);

function makeResourceTypeSubscriptionsCtrl($scope, $stateParams, notificationsAPI) {
    var vm = this;

    vm.subscribeUser = subscribeUser;
    vm.onSelectUserFromTypeAhead = onSelectUserFromTypeAhead;
    vm.onSearch = onSearch
    vm.nextPage = nextPage

    $scope.$watch('ResourceTypeDetail.resourceType', init, true);

    function init() {
        if (!$scope.ResourceTypeDetail.resourceType) {
            return;
        }

        vm.subscribersHaveLoaded = false;
        getSubscriptions()
    }

    function getSubscriptions() {
        if (!vm.query) {
            vm.query = {
                pageSize: 99,
                page: 1
            }
        }

        return notificationsAPI.getSubscribersForResourceType($stateParams.id, vm.query).then(function (response) {
            vm.subscribers = response.data;
            vm.subscribersHaveLoaded = true;
            return response.data
        });
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

    function subscribeUser() {
        vm.isSavingSubscriber = true;

        notificationsAPI.subscribeUserToResourceType($scope.ResourceTypeDetail.resourceType, vm.newUser.wwtUserId).then(function (response) {
            vm.subscribers.push(response.data);
            vm.isAddingSubscriber = false;
            vm.isSavingSubscriber = false;
        });
    }

    function onSelectUserFromTypeAhead(user) {
        vm.newUser = user;
    }
}