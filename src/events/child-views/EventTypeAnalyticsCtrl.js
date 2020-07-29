appModule.controller('EventTypeAnalyticsCtrl', makeEventTypeAnalyticsCtrl)

function makeEventTypeAnalyticsCtrl(notificationsAPI, $state, $scope, envExtended, resourcesAPI) {
    var vm = this

    window['moment-range'].extendMoment(moment)
    $scope.envExtended = envExtended
    vm.getDetailParams = getDetailParams
    vm.init = init

    init()

    function init() {
        resourcesAPI.getEventTypeById($state.params.id).then(function (eventResponse) {
            var eventType = eventResponse.data

            vm.reportId = `resource-type.${eventType.resourceType.id}`
            vm.reportSelect = `category,data.${eventType.id}`

            var today = new Date()

            if (!vm.fromDate) {
                vm.fromDate = new Date(new Date().setDate(today.getDate()-7))
            }

            if (!vm.toDate) {
                vm.toDate = new Date()
            }

            vm.isLoading = true

            notificationsAPI.getEventEmailAnalytics($state.params.id, vm.fromDate, vm.toDate).then(function (response) {
                setChart(response.data)
            })
        })
    }

    function getDetailParams(args) {
        return {
            startDate: _.get(args, 'category'),
            endDate: _.get(args, 'category'),
            resourceTypeId: _.get($scope.EventTypeDetail.eventType, 'resourceType.id'),
            eventTypeId: $state.params.id
        }
    }

    function setChart(data) {

        var range1 = moment.range(vm.fromDate, vm.toDate);
        var days = Array.from(range1.by('day'));

        days = _.map(days, function (it) {
            return {
                date: it.format('MM/DD/YY')
            }
        })

        data = _.map(data, function (it) {
            it.date = moment(it.who.creationDate).format('MM/DD/YY')
            return it
        })

        days.forEach(function (day) {
            day.data = _.remove(data, function (it) {
                return it.date == day.date
            })
        })

        var dateSent = _.map(_.cloneDeep(days), function (it) {
            return it.data.length
        })

        var dateSentViews = _.map(_.cloneDeep(days), function (it) {
            return _.filter(it.data, function (notifcation) {
                return notifcation.readAt
            }).length
        })

        var dataDates = _.map(_.cloneDeep(days), function (it) {
            return it.date
        })

        vm.chartConfig = {
            options: {
                chart: {
                    type: 'column'
                },
                tooltip: {
                    style: {
                        padding: 10,
                        fontWeight: 'bold'
                    }
                }
            },
            series: [
                {
                    name: 'Sent',
                    type: 'column',
                    data: dateSent
                },
                {
                    name: 'Read',
                    type: 'column',
                    data: dateSentViews
                }
            ],
            title: {
                text: 'Emails'
            },
            credits: {
                enabled: false
            },
            loading: false,
            xAxis: {
                categories: dataDates,
                currentMin: 0,
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Notifications'
                }
            }
        };

        vm.isLoading = false
    }
}