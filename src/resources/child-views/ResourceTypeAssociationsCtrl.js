appModule.controller('ResourceTypeAssociationsCtrl', makeResourceTypeAssociationsCtrl);

function makeResourceTypeAssociationsCtrl(resourcesAPI, $stateParams) {
    var vm = this;

    vm.searchForAssociations = searchForAssociations;
    vm.shouldShowNoResults = shouldShowNoResults;

    init();

    function init() {
        // temporarily disabling this view for performance reasons.
        return

        resourcesAPI.getResourceTypes().then(function (response) {
            vm.advancedTypeOptions = _.map(_.filter(response.data, 'url'), 'id');
        });

        resourcesAPI.getAssociationsForResourceType($stateParams.id).then(function (response) {
            vm.exampleAssociations = response.data.data;
        });
    }

    function searchForAssociations(searchText) {
        vm.foundResources = [];
        vm.advancedResults = [];

        if (!searchText) {
            return false;
        }

        vm.isSearching = true;

        var typeParams = getFormmatedSearchTypeParams();

        resourcesAPI.getAssociations($stateParams.id, searchText, typeParams).then(function (response) {
            vm.isSearching = false;

            vm.currentRequest = getFormattedUrl(response.config.url);

            if (typeParams) {
                _.forIn(response.data, function(value, key) {
                    if (key !== 'pagination') {
                        if (!value.data) {
                            return;
                        }

                        vm.advancedResults.push({key: key, data: value.data.data});
                    }
                });
            } else {

                if (!response.data) {
                    return;
                }

                vm.foundResources = mapAssociationsAsResources(response.data.data, searchText);
            }
        });
    }

    function getFormattedUrl(url) {
        return url.split("/").slice(6).join("/");
    }

    function getFormmatedSearchTypeParams() {
        var params = '';

        if (!vm.advancedResourceTypes || !vm.advancedResourceTypes.length) {
            return params;
        }

        params += '?type=';

        vm.advancedResourceTypes.forEach(function (it) {
            params += it + ',';
        });

        // remove last comma
        params = params.replace(/,\s*$/, "");

        return params;
    }

    function mapAssociationsAsResources(associations, searchText) {
        if (!associations) {
            return [];
        }

        var mapped = [];

        associations.forEach(function (association) {
            association.resources.forEach(function (resource) {
                // try to ignore the resource the user is searching for and just
                // return the associated resources
                if (resource.id != searchText) {
                    mapped.push(resource);
                }
            });
        });

        return mapped;
    }

    function shouldShowNoResults() {
        return vm.searchText &&
                !vm.isSearching &&
                (!vm.foundResources || !vm.foundResources.length) &&
                (!vm.advancedResults || !vm.advancedResults.length);
    }
}
