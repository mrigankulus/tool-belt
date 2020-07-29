appModule.controller('UserGroupsCtrl', makeUserGroupsCtrl);

function makeUserGroupsCtrl($scope, $state, Group, userPermissionsAPI) {
    var vm = this;

    vm.pageSize = 100;
    vm.currentPageNumber = 1;
    vm.loaded = false
    vm.loadGroups = loadGroups

    init();

    $scope.$watch('UserDetail.user', init);

    function init() {
        if (!$scope.UserDetail.user) {
            return;
        }

        userPermissionsAPI.canViewAllGroups().then(function (response) {
            vm.canViewAllGroups = response;

            if (vm.canViewAllGroups) {
                loadGroups()
            }
        });
    }

    function loadGroups(pageNumber) {
        vm.loaded = false

        var query = {
            select: 'title,types',
            embed: 'types',
            page: pageNumber || 1,
            limit: vm.pageSize,
            memberId: $scope.UserDetail.user.id
        }

        if (vm.searchText) {
            query.search = vm.searchText;
        }

        Group.find(query).then(function (response) {
            vm.groups = response.data.docs

            setPagination(response.data)

            vm.loaded = true
        })
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
