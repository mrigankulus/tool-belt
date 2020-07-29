appModule.config(function ($stateProvider) {

    $stateProvider.state('importExport', {
        url: '/import-export',
        templateUrl: 'import-export/importExport.html',
        controller: 'ImportExportCtrl',
        controllerAs: 'ImportExport',
        data: {
            pageName: 'import-export',
            browserTitle: 'Import/Export',
            isSearchable: true
        }
    });

    $stateProvider.state('importExportScorecard', {
        url: '/import-export-scorecard',
        templateUrl: 'import-export/importExportScorecard.html',
        controller: 'ImportExportScorecardCtrl',
        controllerAs: 'ImportExportScorecard',
        data: {
            pageName: 'import-export-scorecard',
            browserTitle: 'Import/Export',
            isSearchable: true
        }
    });


    $stateProvider.state('importExportScorecard.export', {
        url: '/exportScorecard',
        templateUrl: 'import-export/exportScorecard.html',
        controller: 'ExportScorecardCtrl',
        controllerAs: 'ExportScorecard',
        data: {
            pageName: 'export',
            browserTitle: 'Export'
        }
    });


    $stateProvider.state('importExportScorecard.import', {
        url: '/importScorecard',
        templateUrl: 'import-export/importScorecard.html',
        controller: 'ImportScorecardCtrl',
        controllerAs: 'ImportScorecard',
        data: {
            pageName: 'import',
            browserTitle: 'Import'
        }
    });

    $stateProvider.state('importExport.import', {
        url: '/import',
        templateUrl: 'import-export/import.html',
        controller: 'ImportCtrl',
        controllerAs: 'Import',
        data: {
            pageName: 'import',
            browserTitle: 'Import'
        }
    });

    $stateProvider.state('importExport.export', {
        url: '/export',
        templateUrl: 'import-export/export.html',
        controller: 'ExportCtrl',
        controllerAs: 'Export',
        data: {
            pageName: 'export',
            browserTitle: 'Export'
        }
    });
});
