appModule.factory('navSearch', makeNavSearch);

function makeNavSearch() {
    var navSearch = {};

    navSearch.filterForItem = function (item) {

        if (!navSearch.searchTerm || !item || !item.title) {
            return true;
        }

        var searchTerm = navSearch.searchTerm.toLowerCase();

        return item.title.toLowerCase().indexOf(searchTerm) > -1 ||
            (item.description && item.description.toLowerCase().indexOf(searchTerm) > -1) ||
            _.find(item.keywords, function (it) {
                if (!it) {
                    return false;
                }

                return it.toLowerCase().indexOf(searchTerm) > -1
            });
    }

    return navSearch;
}