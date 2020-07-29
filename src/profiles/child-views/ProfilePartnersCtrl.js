appModule.controller('ProfilePartnersCtrl', makeProfilePartnersCtrl);

function makeProfilePartnersCtrl($scope, partnersAPI, $stateParams, $timeout) {
    var vm = this;

    vm.searchPartners = searchPartners;
    vm.addPartnerToProfile = addPartnerToProfile;
    vm.profileHasPartner = profileHasPartner;
    vm.removePartnerFromProfile = removePartnerFromProfile;
    vm.partnersLimitStart = 30;
    vm.partnerLimit = vm.partnersLimitStart;

    init();

    function init() {
        vm.isLoadingPartners = true;
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        partnersAPI.getPartnersForProfile($stateParams.profileId).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;
            vm.partners = response.data;
            vm.isLoadingPartners = false;
        });
    }

    function searchPartners(term) {
        vm.showMinCharLimitMsg = false;

        if (term.length > 0 && term.length < 3) {
            return vm.showMinCharLimitMsg = true;
        }

        if (term.length < 3) {
            return;
        }

        vm.showMinCharLimitMsg = false;
        vm.availablePartners = [];

        partnersAPI.searchPartners(term).then(function (response) {
            if (response.data) {
                vm.availablePartners = response.data.map(function (c) {
                    return {id: c.objAltValue, name: c.objValue, type: c.type};
                });
            }
        });
    }

    function addPartnerToProfile() {
        partnersAPI.addPartnerToProfile(vm.newPartner, $scope.ProfileDetail.profile).then(function (response) {
            vm.newPartner.associationId = response.data.id;
            vm.partners.push(vm.newPartner);
            vm.newPartner = '';
            vm.isAddingPartner = false;
        });
    }

    function profileHasPartner(partner) {
        return _.find(vm.partners, {id: partner.id});
    }

    function removePartnerFromProfile(partner) {
        partnersAPI.removePartnerFromProfile(partner, $scope.ProfileDetail.profile);
        _.remove(vm.partners, {id: partner.id});
    }
}
