appModule.controller('VueGroupsCtrl', makeVueGroupsCtrl)

function makeVueGroupsCtrl ($scope, $state, $timeout) {
    var vm = this

    vm.vueComponent = {}

    init()
    function init() {
        var profile = _.get($scope, 'UsersForProfile.profile')
        var groupId

        if (_.get(profile, 'id')) {
            groupId = 'wwt-profile:' + profile.id
        } else {
            groupId = $state.params.id
        }
        vm.vueComponent = new Vue({
            el: "#wwt-vue-groups",
            data: {
                groupId: groupId
            },
            components: {
                'group-member-list': Group.GroupMemberList
            },
            methods: {
                toggleWriteAccessTab() {
                    // some hacking to get vue to talk to angular
                    if ($scope.UsersForProfile) {
                        $timeout(function() {
                            $scope.UsersForProfile.activeTab = 'ownerList'
                        })
                    }
                }
            }
        })
    }

    // make sure our Vue component is destroyed when the controller is destroyed
    $scope.$on('$destroy', function onDestroy() {
        vm.vueComponent.$destroy(true)
    })
}
