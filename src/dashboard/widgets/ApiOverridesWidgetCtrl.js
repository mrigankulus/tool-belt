appModule.controller('ApiOverridesWidgetCtrl', makeApiOverridesWidgetCtrl);

function makeApiOverridesWidgetCtrl(apisAPI, wwtUser) {
    var vm = this;

    vm.toggleOverrideState = toggleOverrideState;
    vm.updateDomainOnOverrides = updateDomainOnOverrides;
    vm.cancelOverrideUpdate = cancelOverrideUpdate;
    vm.saveOverrides = saveOverrides;

    init();

    function init() {

        vm.overridesHaveLoaded = false;

        wwtUser.getCurrentUser().then(function (userResponse) {
            apisAPI.getOverridesForUser(userResponse.data).then(function (response) {
                vm.overrides = response.data;
                vm.overridesHaveLoaded = true;
            });
        });
    }

    function cancelOverrideUpdate() {
        init();
        vm.isUpdatingDomain = false;
    }

    function saveOverrides() {
        vm.isUpdatingDomain = false;

        vm.overrides.forEach(function (it) {
            it.isUpdating = true;

            apisAPI.updateOverride(it).then(function () {
                it.isUpdating = false;
            });
        });
    }

    function toggleOverrideState(override) {
        return apisAPI.updateOverride(override);
    }

    function updateDomainOnOverrides(newDomain) {
        vm.overrides.forEach(function (it) {
            it.endPoint = replaceDomain(it.endPoint, newDomain);
        });
    }

    function replaceDomain(url, newDomain) {
        var location = new URI(url);
        var port = location._parts.port ? ':' + location._parts.port : '';

        return location._parts.protocol + '://' + (newDomain || location._parts.hostname) + port + location._parts.path;
    }
}