appModule.controller('ProfileLegacyCustomersCtrl', makeProfileLegacyCustomerCtrl)

function makeProfileLegacyCustomerCtrl(legacyCustomerApi, $stateParams, $scope) {
    var vm = this

    vm.shouldShowBlankSlate = shouldShowBlankSlate
    vm.search = search
    vm.removeCustomer = removeCustomer
    vm.addCustomerToProfile = addCustomerToProfile

    init()

    function init() {
        vm.isLoading = true;

        legacyCustomerApi.getForProfileId($stateParams.profileId).then(function (response) {
            vm.customers = response.data;
            vm.isLoading = false;
        });
    }

    function shouldShowBlankSlate() {
        return !vm.isLoading && (!_.size(vm.customers));
    }

    function search(str) {
        if (!str) {
            vm.availableCustomers = []
            return
        }

        return legacyCustomerApi.search(str).then(function (response) {
            vm.availableCustomers = response.data
        })
    }

    function removeCustomer(association) {
        _.remove(vm.customers, function (it) {
            return it.customer.id == association.customer.id
        })
        legacyCustomerApi.removeCustomerFromProfile(association)
    }

    function addCustomerToProfile() {
        var newCustomer = {
            id: extractCustomerId(vm.newCustomer),
            name: vm.newCustomer
        }

        vm.isSaving = true

        legacyCustomerApi.addCustomerToProfile($scope.ProfileDetail.profile, newCustomer).then(function (response) {
            vm.customers.push(response.data)
            vm.newCustomer = ''
            vm.isAdding = false
            vm.isSaving = false
        })
    }

    function extractCustomerId(custStr) {
        if (!custStr) {
            return
        }

        var start_pos = custStr.indexOf('(') + 1
        var end_pos = custStr.indexOf(')', start_pos)
        var id = custStr.substring(start_pos, end_pos)

        return id
    }
}