appModule.component('analyzeReportFrame', {
    templateUrl: 'analyitics/analyzeReportFrame.html',
    controller: AnalyzeReportFrameCtrl,
    bindings: {
        reportId: '<',
        getDetailParams: '<',
        select: '<'
    }
});

function AnalyzeReportFrameCtrl($sce, envExtended, $timeout, $http, $scope) {
    var vm = this

    vm.timeFrame = '30.days'
    vm.setTimeFrame = setTimeFrame

    init()

    function init() {
        vm.iframeUrl = ''
        vm.analyticsDetailParams = ''

        // timeout simplifies refreshing report
        $timeout(function () {
            var url = `//analyze-reports.apps${envExtended.getTargetEnvModifier()}.wwt.com/reports/${vm.reportId}`
            url += `?api_timeFrame=${vm.timeFrame}&chartType=column&listenForClicks=true`

            if (vm.select) {
                url += `&api_select=${vm.select}`
            }
            vm.iframeUrl = $sce.trustAsResourceUrl(url)
            window.addEventListener('message', onReportClick, false)
        }, 50)
    }

    function setTimeFrame(timeFrame) {
        vm.timeFrame = timeFrame
        init()
    }

    function onReportClick(e) {
        if (vm.getDetailParams && e.data) {
            let data = JSON.parse(e.data)
            $timeout(function () {
                openAnalyticsDetail({
                    category: data.category,
                    seriesName: data.series
                })
            })
        }
    }

    function openAnalyticsDetail(args) {
        vm.analyticsDetailParams = ''

        if (!vm.getDetailParams) {
            return
        }

        $timeout(function () {
            vm.analyticsDetailParams = vm.getDetailParams(args)

            // support "months"
            if (_.includes(vm.timeFrame, 'months')) {
                if (vm.analyticsDetailParams.startDate) vm.analyticsDetailParams.startDate += '-01'
                if (vm.analyticsDetailParams.endDate) vm.analyticsDetailParams.endDate += '-30'
            }
        }, 50)
    }

    $scope.$on('$destroy', function onDestroy() {
        window.removeEventListener('message', onReportClick)
    })
}
