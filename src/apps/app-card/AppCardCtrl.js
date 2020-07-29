appModule.controller('AppCardCtrl', makeAppCardCtrl)

function makeAppCardCtrl(userPermissionsAPI) {
    var vm = this;

    vm.init = init;

    init();

    function init() {
        userPermissionsAPI.isDeveloper().then(function (response) {
            vm.isDeveloper = response;
        });

    }
}
