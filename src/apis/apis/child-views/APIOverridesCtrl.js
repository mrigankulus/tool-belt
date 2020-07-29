appModule.controller('APIOverridesCtrl', makeAPIOverridesCtrl);

function makeAPIOverridesCtrl($scope, apisAPI, $stateParams, usersAPI, wwtUser) {
    var vm = this;

    vm.newOverride = {};
    vm.toggleOverrideState = toggleOverrideState;
    vm.deleteOverride = deleteOverride;
    vm.createOverride = createOverride;
    vm.updateOverride = updateOverride;
    vm.openEditForm = openEditForm;
    vm.cancelEditing = cancelEditing;
    vm.openAddOverrideForm = openAddOverrideForm;
    vm.setOverrideEndPointSuggestionsForUser = setOverrideEndPointSuggestionsForUser;
    vm.onEnpointChosen = onEnpointChosen;
    vm.overrideIsValid = overrideIsValid;
    vm.overrideForUserAlreadyExists = overrideForUserAlreadyExists;

    init();

    function init() {
        apisAPI.getOverridesForApi($stateParams.id).then(function (response) {
            vm.overrides = response.data;
        });
    }

    function toggleOverrideState(override) {
        return apisAPI.updateOverride(override);
    }

    function deleteOverride(override) {
        return apisAPI.deleteOverride(override).then(function () {
            return _.remove(vm.overrides, function (it) {
                return it.id === override.id;
            });
        });
    }

    function formatUserForAPIRouterOverride(user) {
        return {
            id: user.wwtUserId,
            ldapUserId: user.userName,
            userName: user.fullName
        };
    }

    function formatUserFromAPIRouter(apiRouterUser) {
        return {
            wwtUserId: apiRouterUser.id,
            userName: apiRouterUser.ldapUserId,
            fullName: apiRouterUser.userName
        };
    }

    function updateOverride(override) {
        override.user = formatUserForAPIRouterOverride(override.user);

        apisAPI.updateOverride(override).then(function (response) {
            override.isEditing = false;
        });
    }

    function createOverride(override) {
        override.apiId = parseInt($stateParams.id);
        override.user = formatUserForAPIRouterOverride(override.user);
        override.isEnabledFlag = true;

        apisAPI.updateOverride(override).then(function (response) {
            vm.overrides.push(response.data);
            vm.newOverride = {};
            vm.isAddingOverride = false;
        });
    }

    function openAddOverrideForm() {
        vm.isAddingOverride = true;

        wwtUser.getCurrentUser().then(function (response) {
            vm.newOverride.user = response.data;
            setOverrideEndPointSuggestionsForUser(vm.newOverride.user);
        });
    }

    function overrideForUserAlreadyExists(override) {
        return _.find(vm.overrides, function (it) {
            return it.user.id === override.user.wwtUserId;
        });
    }

    function overrideIsValid(override) {
        if (!override.user || !override.endPoint) {
            return false;
        }

        return !overrideForUserAlreadyExists(override);
    }

    function openEditForm(override) {
        override.user = formatUserFromAPIRouter(override.user);
        override.isEditing = true;
    }

    function cancelEditing(override) {
        override.user = formatUserForAPIRouterOverride(override.user);
        override.isEditing = false;
    }

    function getOriginFromUrlString(url) {
        var pathArray = url.split('/');
        var protocol = pathArray[0];
        var host = pathArray[2];
        return protocol + '//' + host;
    }

    function setOverrideEndPointSuggestionsForUser(user) {
        if (!user) {
            return false;
        }

        vm.overrideEndPointSuggestions = [];

        apisAPI.getOverridesForUser(user).then(function (response) {
            var currentUserOverrides = response.data;

            if (!currentUserOverrides || !currentUserOverrides.length) {
                vm.newOverride.endPoint = '';
                return false;
            }

            currentUserOverrides.forEach(function (override) {
                var newSuggestion = getOriginFromUrlString(override.endPoint);
                var prefix = $scope.APIDetail.api.routePrefix || '';
                var route = $scope.APIDetail.api.route || '';

                newSuggestion += '/' + prefix + route;

                vm.overrideEndPointSuggestions.push(newSuggestion);
            });

            vm.overrideEndPointSuggestions = _.uniq(vm.overrideEndPointSuggestions);
        });
    }

    function onEnpointChosen(endPoint) {
        vm.newOverride.endPoint = endPoint;
    }
}
