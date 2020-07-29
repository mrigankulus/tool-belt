appModule.controller('GroupDetailCtrl', makeGroupDetailCtrl)

function makeGroupDetailCtrl(Group, $state, recentlyViewed, $scope, messenger, wwtFocusPanelSVC) {
    var vm = this

    init()

    $scope.$state = $state
    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC

    function init() {
        Group.findById($state.params.id).then(function (response) {
            vm.group = response.data

            recentlyViewed.save('groups', vm.group)
            setFeedSettings()
        }).catch(function (err) {
            messenger.showMessage({
                title: err.data.error,
                content: err.data.message,
                isDismissable: true
            })
        })
    }

    function setFeedSettings() {
        let settings = {
            typeId: 'group',
            id: $state.params.id
        }

        if (_.includes($state.params.id, 'wwt-profile:')) {
            // if the groups is a profile group, include the profile history
            settings.relatedResources = [{
                resourceTypeId: 'user-security-profile',
                resourceId: $state.params.id.replace('wwt-profile:', '')
            }]
        }

        vm.feedSettings = settings
    }
}