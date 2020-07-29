appModule.controller('GroupsLandingCtrl', makeGroupsLandingCtrl)

function makeGroupsLandingCtrl($state, $scope, aboutProfileGroupConversionUrl) {
    var vm = this

    $scope.$state = $state
    $scope.aboutProfileGroupConversionUrl = aboutProfileGroupConversionUrl
}