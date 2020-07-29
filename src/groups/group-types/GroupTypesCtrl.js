appModule.controller('GroupTypesCtrl', makeGroupTypesCtrl)

function makeGroupTypesCtrl(GroupType, wwtFocusPanelSVC, $scope, $state) {
    var vm = this

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC
    vm.onCreate = onCreate
    vm.getDetailParams = getDetailParams

    init()

    function init() {
        GroupType.find().then(function (response) {
            vm.groupTypes = response.data
            vm.reportId = `group-events-by-type`
        })
    }

    function onCreate(groupType) {
        if (!vm.groupTypes) {
            vm.groupTypes = []
        }

        vm.groupTypes.push(groupType)
        $state.go('groups.groupTypeDetail', {id: groupType.id})
    }

    function getDetailParams(args) {
        var params = {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            resourceTypeId: 'group'
        }

        if (_.get(args, 'seriesName') && args.seriesName !== 'undefined') {
            // We can't grab analytics where there is no value here, so if there is no
            // group type, we won't really have a filtered view. Is what it is.
            params.metaData = 'types:' + _.get(args, 'seriesName')
        }

        return params
    }
}