appModule.filter('friendlyDate', function($filter) {
    return function(dateString) {

        // sanity check for date
        if (!dateString) {
            return false;
        }
        // be sure the consumer has moment installed. need to use
        // typeof so the browser doesn't throw an error if moment isn't here
        if ((typeof moment === "undefined")) {
            // use angular's date filter (better than nothing)
            return $filter('date')(dateString);
        }

        if (moment(dateString).diff(moment(), 'days')) {
            // it's more than a day old
            return moment(dateString).calendar();
        } else {
            // it's less than a day old so we'll return the relative time
            return moment(dateString).fromNow();
        }

    };
});