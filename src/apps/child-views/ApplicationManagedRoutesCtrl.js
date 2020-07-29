appModule.controller('ApplicationManagedRoutesCtrl', makeApplicationManagedRoutesCtrl)

function makeApplicationManagedRoutesCtrl($scope, $q, $state, $timeout, apisAPI, assetState, wwtUser) {
    var vm = this

    vm.updateDomains = updateDomains;
    vm.openGenerateOverridesForm = openGenerateOverridesForm;
    vm.isDeletingAllOverrides = false;
    $scope.allOverrides;
    $scope.user;

    init()
    $scope.$watch('asset.id', init);

    function init(newData, oldData) {
        if (!newData) {
            return false;
        }

        vm.overrides = []

        vm.apisHaveLoaded = false
        if (!assetState.currentAsset.appName) {
            assetState.currentAsset.appName = assetState.currentAsset.routePrefix
        }
        $scope.appName = assetState.currentAsset.appName
        wwtUser.getCurrentUser().then(function (response) {
            $scope.user = response.data
        })
        apisAPI.getApisForApplication(assetState.currentAsset).then(function (response) {
            vm.apis = response.data

            vm.apis = vm.apis.filter(function(el) {
                return el.versionDefault === true
            })

            vm.apisHaveLoaded = true
            apisAPI.getOverridesForUser().then(function (overridesResponse) {
                if (_.size(overridesResponse.data)) {
                    vm.overrides = _.filter(overridesResponse.data, function (override) {
                        var allOn = true
                        var allOff = true

                        for (let i in overridesResponse.data) {
                            if (overridesResponse.data[i].isEnabledFlag == false) {
                                allOn = false
                            }
                            if (overridesResponse.data[i].isEnabledFlag == true) {
                                allOff = false
                            }
                        }

                        if (allOn == true) {
                            vm.allOnDisabled = true
                            vm.allOffDisabled = false
                        }

                        if (allOff == true) {
                            vm.allOffDisabled = true
                            vm.allOnDisabled = false
                        }
                        return _.find(vm.apis, { id: override.apiId })
                    })
                }
            })
        })
    }

    function updateDomains() {
        if (!vm.newDomain) {
            return
        }
        vm.newDomain = vm.newDomain.replace('http://', '')
        vm.overrides.forEach(function (it) {
            it.endPoint = replaceDomainAndPort(it.endPoint, vm.newDomain)
            apisAPI.updateOverride(it)
        })

        vm.isUpdateAllDomains = false
    }

    function replaceDomainAndPort(url, newDomain) {
        var location = new URI(url);
        var port = location._parts.port ? ':' + location._parts.port : '';

        return location._parts.protocol + '://' + (newDomain || location._parts.hostname) + location._parts.path;
    }

    function openGenerateOverridesForm() {
        vm.isGeneratingOverrides = true;

        wwtUser.getCurrentUser().then(function (response) {
            // vm.newOverride.user = response.data;
            // setOverrideEndPointSuggestionsForUser(vm.newOverride.user);
        });
    }
}
