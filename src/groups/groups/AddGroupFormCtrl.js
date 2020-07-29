appModule.controller('AddGroupFormCtrl', makeAddGroupFormCtrl)

function makeAddGroupFormCtrl ($scope, $state) {
    var vm = this

    vm.vueComponent = {}

    init()
    function init() {
        vm.vueComponent = new Vue({
            el: "#vue-add-group-form",
            components: {
                'add-group-form': Group.AddGroupForm
            },
            methods: {
                viewDetails(group) {
                    $state.go('groups.groupDetail', { id: group.id })
                }
            }
        })
    }

    // make sure our Vue component is destroyed when the controller is destroyed
    $scope.$on('$destroy', function onDestroy() {
        vm.vueComponent.$destroy(true)
    })
}
