appModule.controller('ExportScorecardCtrl', makeExportScorecardCtrl);

function makeExportScorecardCtrl($q, $scope, $timeout, searcherCollections, apisAPI) {
    var vm = this;

    // ensure these get reset

    vm.termSelected = false

    vm.searchExportables = searchExportables;
    vm.onSearchResultSelected = onSearchResultSelected;
    vm.onCopy = onCopy;

    function onSearchResultSelected(item) {
        vm.termSelected = true
        apisAPI.getApiExceptions(item.raw.id).then(function (response) {
            vm.allUrlExceptions = getUniqueExceptions(response)
        })
        vm.selectedItem = item
        vm.searchTerm = '';
    }

    function slugIsSupported(slug) {
        return slug === 'apis'
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

    function getUniqueExceptions(alertArray) {
        if (alertArray.length <= 0) {
            return []
        }
        let resArray = []
        let x = alertArray.filter(function (item) {
            let i = resArray.findIndex(x => x.urlPathPattern == item.urlPathPattern && x.method == item.method)
            if (i <= -1) {
                if (item.method == "GET") {
                    item.methodColor = 'blue'
                } else if (item.method == "POST") {
                    item.methodColor = 'green'
                } else if (item.method == "PUT") {
                    item.methodColor = 'orange'
                }
                if (item.requestBody) {
                    item.requestBody = JSON.parse(item.requestBody)
                } else {
                    item.requestBody = {}
                }
                resArray.push(item)
            }
            return null
        })
        return resArray
    }

    function onCopy(e) {
        e.clearSelection();
        vm.shouldShowCopiedMessage = true;

        $timeout(function () {
            vm.shouldShowCopiedMessage = false;
        }, 3000);
    }
}
