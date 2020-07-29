appModule.controller('UserPartnersCtrl', makeUserPartnersCtrl);

function makeUserPartnersCtrl($scope, $state, partnersAPI, userPermissionsAPI) {
    var vm = this;

    vm.searchPartners = searchPartners;
    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.partnersLimit = 24;

    init();

    $scope.$watch('UserDetail.user', init);

    function init() {
        if (!$scope.UserDetail.user) {
            return;
        }

        if ($scope.UserDetail.user.internal) {
            $state.go('userDetail');
            return;
        }

        userPermissionsAPI.canApplyPartners().then(function (response) {
            vm.canApplyPartners = response;
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
            if (response.data && response.status !== 512) {
                vm.availablePartners = response.data.map(function (c) {
                    return {partnerGroupId: c.objAltValue, name: c.objValue, type: c.type.toUpperCase(), status: 'ACTIVE'};
                });
            }
        });
    }

    function shouldShowShowMore() {
        return vm.partners && !vm.partnerSearchText && (vm.partners.length > vm.partnersLimit);
    }

    function showMore() {
        vm.partnersLimit += vm.partners.length;
    }

}
