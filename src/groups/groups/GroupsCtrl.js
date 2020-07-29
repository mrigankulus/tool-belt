appModule.controller('GroupsCtrl', makeGroupsCtrl)

function makeGroupsCtrl(Group, recentlyViewed, $scope, wwtFocusPanelSVC) {
    var vm = this

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC
    vm.limit = 51
    vm.search = search
    vm.onPageChange = onPageChange
    vm.currentPageNumber = 1
    vm.pageSize = 100

    init()

    function init() {
        loadGroups(vm.currentPageNumber)
    }

    function loadGroups(pageNumber) {
        vm.loaded = false

        var query = {
            select: 'title,types',
            embed: 'types',
            page: pageNumber,
            limit: vm.pageSize
        }

        Group.find(query).then(function (response) {
            if (_.get(response, 'data.docs')) {
                vm.groups = response.data.docs
            }

            setPagination(response.data)

            vm.loaded = true


            recentlyViewed.get('groups').then(function (recentResponse) {
                if (_.size(recentResponse.data)) {
                    var ids = _.chain(recentResponse.data).map('id').compact().uniq().slice(0, 10).join(',').value()
                    var query = {
                        ids: ids,
                        select: 'title,types',
                        embed: 'types'
                    }
                    Group.find(query).then(function (response) {
                        if (_.get(response, 'data.docs')) {
                            vm.recentGroups = response.data.docs
                        }
                    })
                }
            })
        })
    }

    function search(searchText) {
        vm.loaded = false

        var query = {
            search: searchText,
            select: 'title,types',
            embed: 'types',
            page: 1,
            limit: vm.pageSize
        }

        Group.find(query).then(function (response) {
            if (_.get(response, 'data.docs')) {
                vm.groups = response.data.docs
            }

            setPagination(response.data)

            vm.loaded = true
        })
    }

    function onPageChange() {
        loadGroups(this.currentPageNumber)
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
