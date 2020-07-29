appModule.controller('APIRelatedRoutesCtrl', makeAPIRelatedRoutesCtrl)

function makeAPIRelatedRoutesCtrl($scope, $q, $state, $timeout, apisAPI, assetState, wwtUser) {
    var vm = this

    vm.openGenerateOverridesForm = openGenerateOverridesForm;
    vm.turnAllOverridesOn = turnAllOverridesOn;
    vm.turnAllOverridesOff = turnAllOverridesOff;
    vm.createAllOverrides = createAllOverrides;
    vm.deleteAllOverrides = deleteAllOverrides;
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
            $scope.allApis = vm.apis

            vm.apis.forEach(function (api) {
                apisAPI.getOverridesForApiAndUser(api.id, $scope.user.wwtUserId).then(function (response) {
                    if(response.data.length > 0) {
                        vm.userHasOverrides = true
                    }
                })
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
                $scope.allOverrides = overridesResponse.data
            })
        })
    }


    function turnAllOverridesOn() {
        var apis = $scope.allApis
        var user = $scope.user
        for (let i in apis) {
            apisAPI.getOverridesForApiAndUser(apis[i].id, user.wwtUserId).then(function (override) {
                var currentOverride = override.data[0]
                if (currentOverride && !currentOverride.isEnabledFlag) {
                    currentOverride.isEnabledFlag = true
                    $scope.$broadcast('all-overrides-turned-on')
                    apisAPI.updateOverride(currentOverride)
                    vm.allOnDisabled = true
                    vm.allOffDisabled = false
                }

            })
        }
    }

    function turnAllOverridesOff() {
        var apis = $scope.allApis
        var user = $scope.user
        for (let i in apis) {
            apisAPI.getOverridesForApiAndUser(apis[i].id, user.wwtUserId).then(function (override) {
                var currentOverride = override.data[0]
                if (currentOverride && currentOverride.isEnabledFlag) {
                    currentOverride.isEnabledFlag = false
                    $scope.$broadcast('all-overrides-turned-off')
                    apisAPI.updateOverride(currentOverride)
                    vm.allOffDisabled = true
                    vm.allOnDisabled = false
                }
            })
        }
    }

    function openGenerateOverridesForm() {
        vm.isGeneratingOverrides = true;
        wwtUser.getCurrentUser().then(function (response) {
        });
    }

    function createAllOverrides(endPoint) {
        var apis = $scope.allApis
        var overrides = $scope.allOverrides
        var user = $scope.user
        var overridesToBeUpdated = []

        apis.forEach(function (api) {
            var apiRoute = api.route
            apisAPI.getOverridesForApiAndUser(api.id, user.wwtUserId).then(function (overridesResponse) {
                if (_.size(overridesResponse.data)) {
                    var updatedOverride = overridesResponse.data[0]
                    updatedOverride.endPoint = endPoint + apiRoute
                    updatedOverride.isUpdating = true
                    apisAPI.updateOverride(updatedOverride).then(function () {
                        updatedOverride.isUpdating = false
                    })
                } else {
                    var override = {
                        apiId: api.id,
                        endPoint: endPoint + apiRoute,
                        isEnabledFlag: true,
                        user: {
                            id: user.id,
                            ldapUserId: user.userName,
                            userName: user.fullName
                        }
                    }
                    apisAPI.updateOverride(override).then(function () {
                    })
                }
            })
        })

        $timeout(function () {
            $state.reload();
        }, 900);
    }

    function deleteAllOverrides() {
        var apis = $scope.allApis
        return wwtUser.getCurrentUser().then(function (userResponse) {
            for (let y in apis) {
                apisAPI.getOverridesForApiAndUser(apis[y].id, userResponse.data.wwtUserId).then(function (overridesResponse) {
                    if (_.size(overridesResponse.data)) {
                        for (let i in overridesResponse.data) {
                            apisAPI.deleteOverride(overridesResponse.data[i]).then(function (response) {
                            })
                        }
                    }
                })
            }
            $timeout(function () {
                $state.reload();
            }, 900);
        })
    }
    $scope.$on('single-override-state-changed', function (event) {
        vm.allOnDisabled = false
        vm.allOffDisabled = false
    });

}
