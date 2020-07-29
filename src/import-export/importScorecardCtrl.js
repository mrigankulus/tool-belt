appModule.controller('ImportScorecardCtrl', makeImportScorecardCtrl);

function makeImportScorecardCtrl($scope, importer, apisAPI) {
    var vm = this;
    $scope.importer = importer;

    vm.processPastedContent = processPastedContent;
    vm.importExceptions = importExceptions;
    vm.parsedData

    $scope.$watch('Import.pasteArea', processPastedContent, true);

    function processPastedContent() {
        importer.exportListProcessed = [];
        if (!vm.pasteArea) {
            return;
        }
        try {
            vm.badJson = false
            vm.parsedData = JSON.parse(vm.pasteArea)
        } catch (err) {
            vm.badJson = true
            vm.parsedData = []
            return
        }
        try {
            importer.state.badJson = false;
            importer.exportListProcessed = JSON.parse(vm.pasteArea);
            importer.checkImportList();
        } catch (e) {
            importer.state.badJson = true;
        }
    }

    function importExceptions() {
        vm.parsedData.forEach(function (element) {
            element.isProcessing = 'ongoing'
            var dataBody = {
                apiId: element.apiId,
                urlPathPattern: element.urlPathPattern,
                method: element.method
            }
            apisAPI.createImportExceptions(dataBody).then(function (response) {
                if (response.status == 200) {
                    element.isProcessingError = 'complete'
                }
            }).catch(function (error) {
                if (error.data.message === 'This exception already exists.') {
                    element.isProcessingDuplicateMessage = true
                } else {
                    element.isProcessingError = 'error'
                }
                return
            })
        })
    }
}