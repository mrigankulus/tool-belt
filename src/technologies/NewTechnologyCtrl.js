appModule.controller('NewTechnologyCtrl', makeNewTechnologyCtrl)

function makeNewTechnologyCtrl(technologiesApi, $state) {
    var vm = this

    vm.create = create;
    vm.new = {};

    function create() {
        vm.isWorking = true;

        technologiesApi.create(vm.new).then(function (response) {
            $state.go('technologyDetail', {id: response.data.id});
            vm.isWorking = false;
        });
    }

}