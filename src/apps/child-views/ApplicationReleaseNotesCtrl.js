appModule.controller('ApplicationReleaseNotesCtrl', makeApplicationReleaseNotesCtrl);

function makeApplicationReleaseNotesCtrl($scope, appsAPI, $state, userPermissionsAPI, envExtended) {

    const vm = this;

    vm.application = {};
    $scope.releaseNotesBaseUrl = '';
    $scope.appName = '';

    init();

    function init() {
        appsAPI.getAppById($state.params.id).then(function(response) {
            vm.application = response.data;

            $scope.releaseNotesBaseUrl = `https://apirouter.apps${envExtended.getTargetEnvModifier()}.wwt.com/resources/associations/release-notes/`
            $scope.appName = slugify(vm.application.appName)

            $scope.vueComponentExample = `<ReleaseNotes app-name="${$scope.appName}" />`

            $scope.attachmentsSettings = {
                readonly: true,
                resourceTypeName: 'release-notes',
                resourceId: $scope.appName,
                eventData: vm.application
            };

            userPermissionsAPI.canEditApps().then(function(response) {
                $scope.attachmentsSettings.readonly = !response;
            });
        });
    }

    function slugify(text){
          return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
    }

}
