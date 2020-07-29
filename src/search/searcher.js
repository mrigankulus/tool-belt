appModule.factory('searcher', makeSearcher);

function makeSearcher(searcherCollections, featureFlagsSVC, $rootScope, $q, $log) {
    var searcher = {};

    searcher.search = function (searchTerm) {
        if (!searchTerm) {
            return false;
        }

        var searchTerm = searchTerm.toLowerCase();

        searcherCollections.resultCollections = []

        searcherCollections.collections.forEach(function (collection) {
            if (collection.restrictToFeatureFlag && !featureFlagsSVC.flagIsActive(collection.restrictToFeatureFlag)) {
                return;
            }

            searcher.validatePermissionsForCollection(collection).then(function () {
                collection.limit = 5;

                collection.isSearching = true;

                collection.dataGetter(searchTerm).then(function (response) {
                    collection.isSearching = false;

                    collection.results = [];

                    var results = response;

                    if (collection.resultMapper) {
                        results.forEach(function (it) {
                            collection.results.push(collection.resultMapper(it));
                        });
                    } else {
                        collection.results = results;
                    }

                    _.remove(searcherCollections.resultCollections, function (it) {
                        return it.slug === collection.slug
                    })

                    searcherCollections.resultCollections.push(collection)

                    $rootScope.$broadcast('force-wwt-scroll-trap-refresh', {instanceName: 'globalSearchScrollTrap'});
                });
            }).catch(function (err) {
                $log.warn(err);
                return $q.when(true);
            })
        });
    };

    searcher.validatePermissionsForCollection = function (collection) {
        if (!collection.restrictToPermissionFunc) {
            return $q.when(true);
        }

        return collection.restrictToPermissionFunc().then(function (response) {
            return response || $q.reject('User does not have permission to search ' + collection.title + '.');
        });
    };

    return searcher;
}