appModule.controller('ResourceTypeAnalyticsCtrl', makeResourceTypeAnalyticsCtrl)

function makeResourceTypeAnalyticsCtrl($state) {
    var vm = this

    vm.getDetailParams = getDetailParams
    vm.reportId = ''

    init()

    function init() {
        vm.reportId = `resource-type.${$state.params.id}`
    }

    function getDetailParams(args) {
        return {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            resourceTypeId: $state.params.id,
            eventTypeId: _.get(args, 'seriesName')
        }
    }
}