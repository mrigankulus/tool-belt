appModule.controller('DependencyListCtrl', makeDependencyListCtrl);

function makeDependencyListCtrl($scope, $state, componentsAPI, assetState, userPermissionsAPI, $http, apisAPI, wwtEnv) {
    var vm = this;

    vm.isLinkableDep = isLinkableDep;
    vm.shouldShowDeps = shouldShowDeps;
    vm.getNPMLink = getNPMLink;

    $scope.assetState = assetState;

    $scope.$watch('assetState.currentAsset', init, true)

    function init(newData, oldData) {
        if (newData.isLoading) {
            return
        }

        if (vm.hasLoaded) {
            return
        }

        vm.packageJson = assetState.currentAsset.packageJson;
        componentsAPI.getComponents().then(function (response) {
            vm.components = response.data;
            setDependentApis()
            vm.hasLoaded = true
        });

        checkPermissions();
    }

    function setDependentApis() {
        var product = {}

        if ($state.includes('apiDetail')) {
            product = {
                type: 'api',
                id: $state.params.id
            }
        } else {
            product = {
                type: 'application',
                id: $state.params.id
            }
        }

        getApiStats(product).then(function (response) {
            var apiNames = _.map(_.get(response, 'data.requests'), function (it) {
                return _.get(it, 'message.requestAud.apiName')
            })

            apisAPI.getApis().then(function (apisResponse) {
                var apis = _.filter(apisResponse.data, function (api) {
                    return _.uniq(apiNames).indexOf(api.apiName) > -1
                })

                if (apis && apis.length) {
                    vm.hasApiDeps = true
                }

                var componentDeps = getComponentDeps()

                var deps = []

                apis.forEach(function (api) {
                    api.type = 'api'
                    deps.push(api)
                })

                componentDeps.forEach(function (component) {
                    component.type = 'component'
                    deps.push(component)
                })

                vm.wwtDeps = deps
            })
        })
    }

    function getApiStats(product) {
        if (!product.id) {
            return []
        }

        var url = wwtEnv.getApiForwardUrl() + '/api-logs/log-events'

        var callingProduct = encodeURIComponent(JSON.stringify({
            type: product.type,
            id: parseInt(product.id)
        }))

        url += '?callingProduct=' + callingProduct + '&count=700'

        return $http.get(url, {cache: true, willHandleErrors: true});
    }

    function getComponentDeps() {
        var deps = []
        deps = deps
                .concat(_.get(assetState, 'currentAsset.packageJson.dependencies'))
                .concat(_.get(assetState, 'currentAsset.packageJson.peerDependencies'))
                .concat(_.get(assetState, 'currentAsset.packageJson.devDependencies'))

        _.remove(deps, function (it) {
            return !it
        })

        var componentDeps = vm.components.filter(function (component) {
            return deps.find(function (depGroup) {
                return depGroup[component.name]
            })
        })

        return componentDeps
    }

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

        var request;

        if ($scope.Application) {
             request = userPermissionsAPI.canEditApps;
        } else if ($scope.APIDetail) {
             request = userPermissionsAPI.canEditApis;
        } else if ($scope.Component) {
             request = userPermissionsAPI.canEditComponents;
        }

        if (request) {
            request().then(function (response) {
                vm.canEdit = response;
                vm.permissionsHaveLoaded = true;
            });
        }
    }

    function isLinkableDep(dep) {
        if (!vm.components || !vm.components.length) {
            return;
        }

        return _.find(vm.components, {id: dep});
    }

    function shouldShowDeps(deps) {
        if (!deps) {
            return;
        }

        return Object.keys(deps).length;
    }

    function getNPMLink(dep) {
        return 'https://www.npmjs.com/package/' + dep;
    }
}
