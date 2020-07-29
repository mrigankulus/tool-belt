appModule.controller('TechnologyComponentsCtrl', makeTechnologyComponentsCtrl)

function makeTechnologyComponentsCtrl($scope, componentsAPI) {
    var vm = this

    $scope.$watch('Technology.technology', init)

    function init() {
        if (!_.get($scope.Technology, 'technology')) {
            return
        }

        vm.componentsHaveLoaded = false

        componentsAPI.findForTechnology($scope.Technology.technology.id).then(function (response) {
            vm.components = response.data
            vm.componentsHaveLoaded = true
        })
    }
}