appModule.controller('ApiMetricsCtrl', makeApiMetricsCtrl)

function makeApiMetricsCtrl($sce, $window, wwtEnv) {
    var vm = this
    var SPLUNK_STORAGE_KEY = 'dtb-hide-api-splunk-report'

    vm.toggleIsViewingSplunkReport = toggleIsViewingSplunkReport
    vm.getSplunkReportUrl = getSplunkReportUrl
    vm.getReportEnv = getReportEnv

    init()

    function init() {
        vm.splunkReportsAreHidden = ($window.localStorage[SPLUNK_STORAGE_KEY] === 'false' ? false : true)
    }

    function getReportEnv() {
        var env = wwtEnv.getEnv()

        if (env === 'tst' || env === 'test') {
            return 'tst'
        } else if (env === 'prd' || env === 'prod') {
            return 'prd'
        } else {
            return 'dev'
        }
    }

    function getSplunkReportUrl() {
        // Scheduled env specific execution time reports like - https://splunk.wwt.com/en-US/app/search/report?s=%2FservicesNS%2Fweismana%2Fsearch%2Fsaved%2Fsearches%2FDev%2520API%2520Execution%2520Times%2520Scheduled
        var reports = {
            local: 'http://splunk.wwt.com/en-US/embed?s=%2FservicesNS%2Fweismana%2Fsearch%2Fsaved%2Fsearches%2FDev%2520API%2520Execution%2520Times%2520Scheduled&oid=9J3n7YmC9LuOtzgY9bFVVpPxIHZpYbj0hUWVEzvxCnWhr917uKGigqB_8FOlMdCDKXHqJvn3LjGY9PP3fcOa%5Eb1ceE%5EqDojV61xpHIzDeN3LcslORywz3h5%5E%5EvDfoPG02aaLDbuhY59mCT4oeEOy1SWga6vSgc%5EwRn3T1BOTgo7nWng',
            dev: 'https://splunk.wwt.com/en-US/embed?s=%2FservicesNS%2Fweismana%2Fsearch%2Fsaved%2Fsearches%2FDev%2520API%2520Execution%2520Times%2520Scheduled&oid=9J3n7YmC9LuOtzgY9bFVVpPxIHZpYbj0hUWVEzvxCnWhr917uKGigqB_8FOlMdCDKXHqJvn3LjGY9PP3fcOa%5Eb1ceE%5EqDojV61xpHIzDeN3LcslORywz3h5%5E%5EvDfoPG02aaLDbuhY59mCT4oeEOy1SWga6vSgc%5EwRn3T1BOTgo7nWng',
            tst: 'https://splunk.wwt.com/en-US/embed?s=%2FservicesNS%2Fweismana%2Fsearch%2Fsaved%2Fsearches%2FTest%2520API%2520Execution%2520Times%2520Scheduled&oid=UWTcyFX1wieoLYMHKWRkHYD_2%5EEUWFP8o9Ep3qv2BMuBcn__qPbmy3PjOo0hnXC0CWAoW3bm5PR4x0ZQLzeJNZf8WN9l3jpNWT6yt6x%5E720MVY4jmBpaMb6kh2rj4CyHv8%5EPOOYaT9E7%5E3hBWCvDDHnhuJhXfDjhcHm6J3NtwMcq4kL',
            prd: 'https://splunk.wwt.com/en-US/embed?s=%2FservicesNS%2Fweismana%2Fsearch%2Fsaved%2Fsearches%2FProd%2520API%2520Execution%2520Times%2520Scheduled&oid=SlgHDltwMNhmfH2CAs1EdqtwmBWlWBXzrAa26SIRBpYI2teOR1JuXHdgsg0Pd2y2uYbOREBUYtEhjG8C72bt7u2Rw0PUqJW3RGlgiKeP59J2e0W1p7b7lbnxOpQMVAwAxVBlrPg4EkN2oypaJK7%5EmR%5EZ_3AmapqygyiFeGZRqQfOSF'
        }

        return $sce.trustAsResourceUrl(reports[wwtEnv.getEnv()])
    }

    function toggleIsViewingSplunkReport() {
        vm.splunkReportsAreHidden = !vm.splunkReportsAreHidden;
        $window.localStorage[SPLUNK_STORAGE_KEY] = vm.splunkReportsAreHidden;
    }

}