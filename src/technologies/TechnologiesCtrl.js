appModule.controller('TechnologiesCtrl', makeTechnologiesCtrl)

function makeTechnologiesCtrl($scope, technologiesApi, userPermissionsAPI, wwtFocusPanelSVC, envExtended) {
    var vm = this

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC
    $scope.envExtended = envExtended

    init()

    function init() {
        technologiesApi.get().then(function (response) {
            vm.technologies = response.data
        })

        userPermissionsAPI.canViewTechnologies().then(function (response) {
            vm.canViewTechnologies = response
        })
    }
}