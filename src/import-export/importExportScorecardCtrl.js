appModule.controller('ImportExportScorecardCtrl', makeImportExportScorecardCtrl);

function makeImportExportScorecardCtrl($state) {
    var vm = this;

    vm.isOnLandingPage = isOnLandingPage;
    function isOnLandingPage() {
        return $state.is('importExportScorecard');
    }
}
