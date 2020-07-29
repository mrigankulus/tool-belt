appModule.controller('PartnerDetailCtrl', makePartnerDetailCtrl);

function makePartnerDetailCtrl($scope, $state, $stateParams, userPermissionsAPI, partnersAPI, envExtended, partnerRoutes, hotkeys, recentlyViewed) {
    var vm = this;

    vm.tabs = partnerRoutes();

    $scope.envExtended = envExtended;

    init();


    function init() {
        vm.isLoading = true;

        userPermissionsAPI.canViewPartners().then(function (response) {
            vm.canViewPartners = response;

            if (!vm.canViewPartners) {
                return;
            }

            partnersAPI.getPartnerById($stateParams.partnerId).then(function (response) {
                if (!response.data) {
                    recentlyViewed.save('partners', {
                        partnerGroupId: $stateParams.partnerId
                    })

                    vm.isPartnerActive = false;
                    vm.isLoading = false;
                    return
                }

                vm.partner = response.data;

                vm.isPartnerActive = true;

                vm.watcherSettings = {
                    resourceTypeId: 'partner-company',
                    resourceId: $stateParams.partnerId,
                    resourceData: $scope.PartnerDetail.partner,
                    position: 'alignRight'
                };

                vm.resourceEventStreamSettings = {
                    typeId: 'partner-company',
                    id: $stateParams.partnerId
                };

                var friendlyPartner = _.cloneDeep(vm.partner)
                friendlyPartner.type = friendlyPartner.type.toLowerCase()
                recentlyViewed.save('partners', friendlyPartner)

                vm.isLoading = false;
            })
        });

    }

    function goToSettingsTab() {
        if ($state.is('partnerDetail.settings')) {
            return false;
        }

        $state.go('partnerDetail.settings');
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'partnerDetail') {
            $state.go('.profiles-users');
        }
    });

    hotkeys.bindTo($scope)
        .add({
            combo: 'shift+s',
            description: 'Go to Settings Tab',
            callback: function (event, hotkey) {
                event.preventDefault();
                goToSettingsTab();
            }
        });


}
