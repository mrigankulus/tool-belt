appModule.controller('WwtIconTypeAheadCtrl', makeWwtIconTypeAheadCtrl);

function makeWwtIconTypeAheadCtrl($scope, $http, wwtEnv) {

    init()

    function init() {
        var url = wwtEnv.getApiForwardUrl() + '/dev-assets/icons'

        $http.get(url, {cache: true, willHandleErrors: true}).then(function (response) {
            $scope.icons = _.map(response.data, function (it) {
                return it.name
            })
        })
    }

    $scope.onChange = function (newVal) {
        // parent model doesn't seem to update properly unless we handle it
        // manually like this.
        $scope.targetModel = newVal
    };
}