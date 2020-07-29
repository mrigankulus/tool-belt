appModule.factory('recentlyViewed', recentlyViewedFactory)

function recentlyViewedFactory($http, $window, $q) {
    var recentlyViewed = {},
        keyPrefix = 'dtb-recent-view-v3-';

    recentlyViewed.get = function (key, hydratedList) {
        var storageData = $window.localStorage[keyPrefix + key];

        if (!storageData) {
            storageData = $window.localStorage[keyPrefix + key] = JSON.stringify([]);
        }

        var data = JSON.parse(storageData)

        if (hydratedList) {
            data = recentlyViewed.hydrateRecentListFromHydratedList(key, data, hydratedList)
        }

        _.remove(data, function (it) {
            return !it
        })

        return $q.when({
            data: data
        });
    }

    // item must have a unique "id" property
    recentlyViewed.save = function (key, item) {
        var saveMax = 8;

        return recentlyViewed.get(key).then(function (response) {
            var result = response.data;

            // remove it first, if it's already there
            _.remove(result, function (it) {
                return (it.id && it.id == item.id) || (it.partnerGroupId  && it.partnerGroupId == item.partnerGroupId)
            })

            // add to beginning of array
            result.unshift(item);

            if (result.length > saveMax) {
                // remove the last item to ensure this list doesn't get too large.
                result.pop();
            }

            $window.localStorage[keyPrefix + key] = JSON.stringify(response.data);

            return item;
        });
    }

    // item must have a unique "id" property
    recentlyViewed.remove = function (key, item) {
        return recentlyViewed.get(key).then(function (response) {
            var result = response.data;
            _.remove(result, function (it) {
                return (it.id && it.id == item.id) || (it.partnerGroupId  && it.partnerGroupId == item.partnerGroupId)
            })
            $window.localStorage[keyPrefix + key] = JSON.stringify(response.data);

            return item;
        });
    }

    recentlyViewed.hydrateRecentListFromHydratedList = function (key, recentList, hydratedList) {
        // this one is handy for when you can get a full list of things,
        // then recent items, and you'd like to ensure those recent items
        // have the latest info from the version in the list.
        return _.map(recentList, function (recent) {
            var hydrated = _.find(hydratedList, function (it) {
                return it.id == recent.id
            })

            if (!hydrated) {
                // this type has been removed so we need to delete it from recent list
                recentlyViewed.remove(key, recent)
                return
            }

            return hydrated
        })
    }

    return recentlyViewed
}
