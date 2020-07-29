appModule.controller('AboutCtrl', makeAboutCtrl);

function makeAboutCtrl($scope, $state, githubAPI, $sce, $filter, userPermissionsAPI) {
    var vm = this;

    $scope.$watch('asset', setPrimaryRepo, true);

    init();

    function init() {
        vm.permissionsHaveLoaded = false;

        var request;

        if ($scope.Application) {
             request = userPermissionsAPI.canEditApps;
        } else if ($scope.APIDetail) {
             request = userPermissionsAPI.canEditApis;
        } else if ($scope.Component) {
             request = userPermissionsAPI.canEditComponents;
        } else if ($state.includes('technologyDetail')) {
             request = userPermissionsAPI.canViewTechnologies;
        }

        if (request) {
            request().then(function (response) {
                vm.canEdit = response;
                vm.permissionsHaveLoaded = true;
            });
        }
    }

    function setPrimaryRepo() {
        if (!$scope.asset) {
            return false;
        }
        var repos = $scope.asset.connectedRepos;

        if (!repos || !repos.length) {
            return false;
        }

        githubAPI.decodeReadme(repos[0].org, repos[0].repo).then(function (response) {
            var readme = response;
            $scope.readme = readme;
        });

    }

    $scope.skipValidation = function(value) {
        return $sce.trustAsHtml(value);
    };
}
