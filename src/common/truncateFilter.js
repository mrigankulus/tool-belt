appModule.filter('truncate', function() {
    return function(text, length) {
        if (!text) {
            return text
        }

        if (!_.truncate) {
            _.truncate = _.trunc
        }

        if (!length) {
            length = 85
        }

        return _.truncate(text, { length: length })
    };
})