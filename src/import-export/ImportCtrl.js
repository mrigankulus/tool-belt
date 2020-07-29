appModule.controller('ImportCtrl', makeImportCtrl);

function makeImportCtrl($scope, importer) {
    var vm = this;

    $scope.importer = importer;

    vm.processPastedContent = processPastedContent;

    $scope.$watch('Import.pasteArea', processPastedContent, true);

    function processPastedContent() {
        importer.exportListProcessed = [];

        if (!vm.pasteArea) {
            return;
        }
        try {
            importer.state.badJson = false;
            importer.exportListProcessed = JSON.parse(vm.pasteArea);
            importer.checkImportList();
        } catch(e) {
            importer.state.badJson = true;
        }
    }
}