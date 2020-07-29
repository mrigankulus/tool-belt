appModule.controller('PartnersCtrl', makePartnersCtrl);

function makePartnersCtrl($scope, userPermissionsAPI, partnersAPI, envExtended, recentlyViewed) {
    var vm = this;

    vm.searchPartners = searchPartners;
    vm.getGroupTypeCount = getGroupTypeCount;
    vm.filterPartners = filterPartners;
    vm.clearInput = clearInput;

    $scope.envExtended = envExtended;

    init();

    vm.filters = [
        {
            title: 'Customers',
            type: 'customer',
            active: true
        },
        {
            title: 'Vendors',
            type: 'vendor',
            active: true
        },
        {
            title: 'Manufacturers',
            type: 'manufacturer',
            active: true

        }
    ];

    function init() {
        userPermissionsAPI.canViewPartners().then(function (response) {
            vm.canViewPartners = response;
            vm.canEditPartners = true;

            if (!vm.canViewPartners) {
                return;
            }

            if (!vm.partnersSearchText) {
                loadRecentPartners();
            }
        });
    }

    function loadRecentPartners() {
        recentlyViewed.get('partners').then(function (recentResponse) {
            vm.partners = recentResponse.data;

            if (!vm.partners && !vm.partners.length) {
                vm.shouldShowRecentPartnersText = false;
            }

            if (vm.partners && vm.partners.length) {
                vm.shouldShowRecentPartnersText = true;
            }
        })
    }

    function searchPartners() {
        if (!vm.partnersSearchText) {
            loadRecentPartners();
            vm.shouldShowRecentPartnersText = true;
            return;
        }

        if (vm.partnersSearchText.length > 2) {
            vm.isSearching = true;
            vm.shouldShowRecentPartnersText = false;

            partnersAPI.searchPartners(vm.partnersSearchText).then(function (response) {
                vm.partners = response.data;
                vm.isSearching = false;
            });

        }
    }

    function getGroupTypeCount(type) {
        if (!vm.partners || !vm.partners.length) {
            return;
        }

        return _.filter(vm.partners, {type: type}).length;
    }

    function filterPartners(partner) {
        var activeFilters = _.filter(vm.filters, {active: true});
        if (!activeFilters || !activeFilters.length) {
            return;
        }
        let x = _.find(activeFilters, {type: partner.type})
        return _.find(activeFilters, {type: partner.type});
    }

    function clearInput() {
        vm.partnersSearchText = '';
        searchPartners();
    }

}
