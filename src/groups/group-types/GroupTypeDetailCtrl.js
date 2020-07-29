appModule.controller('GroupTypeDetailCtrl', makeGroupTypeDetailCtrl)

function makeGroupTypeDetailCtrl(GroupType, Group, $state, $scope, messenger) {
    var vm = this

    $scope.$state = $state
    vm.getDetailParams = getDetailParams
    vm.pagination = {page: 1, pages: 0}
    vm.onPageChange = onPageChange
    vm.search = search

    init()

    function init() {
        vm.loaded = false

        GroupType.findById($state.params.id).then(function (response) {
            vm.groupType = response.data
            vm.reportId = `group-events-by-type`
            vm.reportSelect = `category,data.${vm.groupType.id}`

            loadGroups()
        }).catch(function (err) {
            messenger.showMessage({
                title: err.data.error,
                content: err.data.message,
                isDismissable: true
            })
        })
    }

    function getDetailParams(args) {
        return {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            resourceTypeId: 'group',
            metaData: 'types:' + $state.params.id
        }
    }

    function loadGroups(pageNumber) {
        var query = {
            type: $state.params.id,
            select: 'title',
            page: pageNumber || 1
        }

        if (vm.searchText) {
            query.search = vm.searchText
        }

        Group.find(query).then(function (response) {
            setPagination(response.data)
            vm.groups = response.data.docs
            vm.loaded = true
        })
    }

    function onPageChange() {
        loadGroups(vm.currentPageNumber)
    }

    function search() {
        loadGroups(1)
    }

    function setPagination(responseData) {
        vm.pagination = {
            total: responseData.total,
            page: responseData.page,
            pages: responseData.pages
        }

        vm.currentPageNumber = vm.pagination.page
    }
}