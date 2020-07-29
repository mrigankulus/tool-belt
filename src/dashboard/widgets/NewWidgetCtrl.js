appModule.controller('NewWidgetCtrl', makeNewWidgetCtrl);

function makeNewWidgetCtrl($scope, $q, searcher, searcherCollections, dashboardSVC) {
    var vm = this;

    vm.searchPinables = searchPinables;
    vm.searcherCollections = searcherCollections;
    vm.mapToGroup = mapToGroup;
    vm.onSearchResultSelected = onSearchResultSelected;

    function onSearchResultSelected(item) {
        var formattedItem = {
            // trim 's' off group slug
            type: item.formatted.groupSlug.slice(0, -1),
            id: item.raw.id,
            data: item.raw
        };

        dashboardSVC.toggleItemIsPinned(formattedItem);
        $scope.Dashboard.processJenkinsJobs();
        vm.searchTerm = '';
    }

    function searchPinables(searchTerm) {
        vm.searchResults = [];

        if (!searchTerm) {
            return false;
        }

        var searchTerm = searchTerm.toLowerCase();
        var requests = [];

        searcherCollections.collections.forEach(function (collection) {

            if (collection.slug === 'applications' || collection.slug === 'apis' || collection.slug === 'components') {
                requests.push(collection.dataGetter(searchTerm).then(function (response) {
                    var results = response;

                    results.forEach(function (it) {
                        var item = {
                            formatted: collection.resultMapper(it),
                            raw: it
                        };

                        vm.searchResults.push(item);
                    });
                }));
            }
        });

        $q.all(requests).then(function (response) {
            // console.log(vm.searchResults);
        });
    }

    function mapToGroup(item) {
        return item.formatted.groupSlug.toUpperCase();
    }
}