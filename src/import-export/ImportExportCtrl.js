appModule.controller('ImportExportCtrl', makeImportExportCtrl);

function makeImportExportCtrl($state) {
    var vm = this;

    vm.isOnLandingPage = isOnLandingPage;

    function isOnLandingPage() {
        return $state.is('importExport');
    }
}