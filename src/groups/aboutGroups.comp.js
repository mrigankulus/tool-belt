appModule.component('aboutGroups', {
    templateUrl: 'groups/aboutGroups.html',
    controller: AboutGroupsCtrl
});

function AboutGroupsCtrl($scope, githubAPI) {
    var vm = this

    init()

    function init() {
        githubAPI.getAndDecodeFile('custom-apps', 'groups-api', 'groupProfileTransition.md').then(function (response) {
            $scope.aboutGroupsMarkdown = response
        })
    }
}