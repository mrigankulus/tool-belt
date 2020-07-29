appModule.filter('startCase', function () {
    return function(str) {
        return _.startCase(str);
    };
});