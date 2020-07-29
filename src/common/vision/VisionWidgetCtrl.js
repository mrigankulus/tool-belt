appModule.controller('VisionWidgetCtrl', makeVisionWidgetCtrl);

function makeVisionWidgetCtrl($scope, $timeout, visionAPI) {
    var vm = this;

    vm.getVisionLink = getVisionLink;
    vm.groupName = $scope.groupName;

    init();

    function init () {
        visionAPI.getIdeasForGroup($scope.groupId).then(function (response) {
            var ideas = response.data;
            vm.isLoadingVisionCounts = true;
            vm.openIdeasCount = getOpenIdeasCount(ideas);
            vm.closedIdeasCount = getClosedIdeasCount(ideas);

            $timeout(function () {
                vm.isLoadingVisionCounts = false;
            }, 150);
        }).catch(function (err) {
            vm.hasError = true;
        });
    }

    function getVisionLink() {
        return visionAPI.getVisionLink($scope.groupId);
    }

    function getOpenIdeasCount (ideas) {
        var openIdeas = _.filter(ideas, function (it) {
            return it.status != 'complete';
        });

        return openIdeas.length;
    }

    function getClosedIdeasCount (ideas) {
        var openIdeas = _.filter(ideas, function (it) {
            return it.status === 'complete';
        });

        return openIdeas.length;
    }
}
