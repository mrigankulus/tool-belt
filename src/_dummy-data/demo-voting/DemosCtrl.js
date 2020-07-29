appModule.controller('DemosCtrl', makeDemosCtrl)

function makeDemosCtrl(DummyDemo, $scope, $timeout, WwtNgSocketChannel, wwtUser, $location) {
  var vm = this

  vm.addPresenter = addPresenter

  init()

  function init() {
    vm.textTrigger = $location.search().textTrigger || 'Presenter Name'
    // new number
    vm.textNumber = $location.search().textNumber || '314-582-2203'
    // old number
    // vm.textNumber = '573-227-2315'
    setChart()

    DummyDemo.findForToday().then(function(response) {
      vm.demo = response.data

      vm.chartConfig.xAxis.categories = _.map(vm.demo.presenters, function (presenter) {
        return presenter.id
      })

      vm.demo.getVotes().then(function () {
        vm.chartConfig.series[0].data = _.map(vm.demo.presenters, function (presenter) {
          return presenter.voteCount
        })

        listenForSocketUpdates()
      })
    })

    setCanAdmin()
  }

  function addPresenter() {
    if (!vm.newPresenter) {
      return
    }

    vm.newPresenter = vm.newPresenter.toLowerCase()
    vm.demo.addPresenter(vm.newPresenter).then(function (response) {
      vm.chartConfig.xAxis.categories.push(vm.newPresenter)
      vm.chartConfig.series[0].data.push(0)
      delete vm.newPresenter
    })
  }

  function listenForSocketUpdates() {
    var channel = new WwtNgSocketChannel('wwt-atc-dev-demo-' + vm.demo.id + '-event', $scope)
    channel.onMessage = function (eventData) {
      if (eventData && eventData.data && eventData.data.data) {
          onSocketEvent(eventData.data.data)
      }
    }
  }

  function onSocketEvent(event) {
    $timeout(function () {
      if (!vm.demo) {
        return
      }

      vm.demo.countResourceEvent(event)
      vm.chartConfig.series[0].data = _.map(vm.demo.presenters, function (presenter) {
        return presenter.voteCount
      })
    })
  }

  function setCanAdmin() {
    wwtUser.getCurrentUser().then(function (response) {
      vm.canAdmin = response.data.userName === 'weismana'
    })
  }

  function setChart() {
    vm.chartConfig = {
        options: {
            chart: {
                type: 'column',
                margin: 0,
                width: 800
            },
            tooltip: {
                style: {
                    padding: 10,
                    fontWeight: 'bold'
                }
            }
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        series: [{
          name: 'Votes',
          type: 'column',
          data: []
        }],

        loading: false,
        xAxis: {
            labels: {
              style: {
                fontSize: '20px',
                fontWeight: 'bold'
              }
            },
            categories: [],
            currentMin: 0,
            title: {
                text: ''
            }
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Event Count'
            }
        }
    };
  }
}
