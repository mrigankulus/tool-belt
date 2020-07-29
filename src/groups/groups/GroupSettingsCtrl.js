appModule.controller('GroupSettingsCtrl', makeGroupSettingsCtrl)

function makeGroupSettingsCtrl($state, $scope) {
    var vm = this

    vm.vueComponent = {}

    init()
    function init() {
        vm.vueComponent = new Vue({
            el: "#vue-edit-group-form",
            components: {
                'edit-group-form': Group.EditGroupForm
            },
            data: {
                groupId: $state.params.id
            },
            methods: {
                viewGroups() {
                    $state.go('groups')
                }
            }
        })
    }

    $scope.$on('$destroy', function onDestroy() {
        vm.vueComponent.$destroy(true)
    })
}
