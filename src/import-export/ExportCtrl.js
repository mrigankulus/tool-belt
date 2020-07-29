appModule.controller('ExportCtrl', makeExportCtrl);

function makeExportCtrl($q, $scope, $timeout, searcherCollections, importer) {
    var vm = this;

    // ensure these get reset
    importer.exportListPreprocessed = [];
    importer.exportListProcessed = [];

    $scope.importer = importer;

    vm.searchExportables = searchExportables;
    vm.onSearchResultSelected = onSearchResultSelected;
    vm.onCopy = onCopy;

    function onSearchResultSelected(item) {
        importer.addItemToExportList(item);
        vm.searchTerm = '';
    }

    function slugIsSupported(slug) {
        return slug === 'resourceTypes' ||
                slug === 'components' ||
                slug === 'technologies'
    }

    function searchExportables(searchTerm) {
        vm.searchResults = [];

        if (!searchTerm) {
            return false;
        }

        var searchTerm = searchTerm.toLowerCase();
        var requests = [];

        searcherCollections.collections.forEach(function (collection) {

            if (slugIsSupported(collection.slug)) {
                requests.push(collection.dataGetter(searchTerm).then(function (response) {
                    var results = response;

                    results.forEach(function (it) {
                        var item = {
                            formatted: collection.resultMapper(it),
                            raw: it,
                            exportables: collection.exportables
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

    function onCopy(e) {
        e.clearSelection();
        vm.shouldShowCopiedMessage = true;

        $timeout(function () {
            vm.shouldShowCopiedMessage = false;
        }, 3000);
    }
}