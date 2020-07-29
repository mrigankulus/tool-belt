appModule.controller('ApplicationAnalyticsCtrl', makeApplicationAnalyticsCtrl);

function makeApplicationAnalyticsCtrl($scope, $state, $q, $timeout, googleAnalyticsAPI, assetState, $filter, appsAPI) {
    var vm = this;

    vm.hasGAConnection = hasGAConnection;
    vm.linkProfile = linkProfile;
    vm.openEditProfileForm = openEditProfileForm;
    vm.showAllAnalyticsUsers = showAllAnalyticsUsers;
    vm.getLimitTo = getLimitTo;
    vm.pageLimit = 10;

    $scope.$watch('asset.id', init);

    function init(newData, oldData) {
        if (!newData) {
            return false;
        }

        vm.showChartError = ''

        googleAnalyticsAPI.getProfiles().then(function (response) {
            vm.availableProfiles = response.data;

            if (hasGAConnection()) {
                vm.selectedProfile = _.find(vm.availableProfiles, function (it) {
                    return assetState.currentAsset.connectedGoogleAnalytics.profile.id === it.id;
                });
            }
        }).catch(function (err) {
            vm.showChartError = err
        })

        if (hasGAConnection()) {
            getConnectedReports();
        }
    }

    function hasGAConnection() {
        if (!assetState.currentAsset.connectedGoogleAnalytics) {
            return false;
        }

        return assetState.currentAsset.connectedGoogleAnalytics.profile.id;
    }

    function getConnectedReports(bustCache) {
        vm.isLoadingReports = true;
        vm.showChartError = false;

        var reportDefinitions = {
            pageViews: {
                onRetrieved: function (response) {
                    vm.pageViewData = response.data.data;
                    setPageViewsChart();
                    vm.isLoadingReports = false;
                    vm.isEditingGAProfile = false;
                }
            },
            pageViewsByDate: {
                onRetrieved: function (response) {
                    var hits = response.data.data;
                    var hitsWithFriendlyDates = [];

                    hits.forEach(function (it) {
                        it.date = moment(it['ga:date']).format('MM/DD');
                        hitsWithFriendlyDates.push(it);
                    });

                    vm.viewsByDateData = hitsWithFriendlyDates;
                    setChart();
                }
            },
            pageViewsByUser: {
                onRetrieved: function (response) {
                    vm.userData = response.data.data;
                }
            },
            eventsByDate: {
                onRetrieved: function (response) {
                    var eventData = response.data ? response.data.data : [];

                    if (eventData && eventData.length) {
                        var eventDataFriendlyDates = [];
                        eventData.forEach(function (it) {
                            it.date = moment(it['ga:date']).format('MM/DD');
                            eventDataFriendlyDates.push(it);
                        });

                        vm.eventsByDateData = eventDataFriendlyDates;
                    } else {
                        vm.eventsByDateData = [];
                    }
                }
            },
            javascriptErrorsByDate: {
                onRetrieved: function (response) {
                    var javascriptErrorData = response.data ? response.data.data : [];

                    if (javascriptErrorData && javascriptErrorData.length) {
                        var eventDataFriendlyDates = [];
                        javascriptErrorData.forEach(function (it) {
                            it.date = moment(it['ga:date']).format('MM/DD');
                            eventDataFriendlyDates.push(it);
                        });

                        vm.javascriptErrorData = eventDataFriendlyDates.reverse();
                    } else {
                        vm.javascriptErrorData = [];
                    }
                }
            }
        };

        _.forIn(reportDefinitions, function (value, key) {
            appsAPI.getAppAnalyticsReport(assetState.currentAsset.id, key, bustCache).then(function (response) {
                value.onRetrieved(response);
            });
        });
    }

    function linkProfile(profile) {
        // todo: can probably remove this extra flag change when this
        // stuff moves to the api.
        vm.isLoadingReports = true;

        appsAPI.linkGAProfile(assetState.currentAsset.id, profile).then(function (response) {
            getConnectedReports(true);
        })
    }

    function openEditProfileForm() {
        if (vm.isEditingGAProfile) {
            vm.isEditingGAProfile = false;
            return;
        }

        vm.isEditingGAProfile = true;

        googleAnalyticsAPI.getProfiles().then(function (response) {
            vm.availableProfiles = response.data;
        });
    }

    function setChart() {
        var dataViews = _.map(vm.viewsByDateData, function (it) {
            return parseInt(it['ga:pageviews']);
        });

        var dataDates = _.map(vm.viewsByDateData, function (it) {
            return it['date'];
        });

        vm.chartConfig = {
            options: {
                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                //will be overriden by values specified below.

                colors: ['#7CB5EC', '#7CB5EC', '#7CB5EC'],
                // if we want a more "WWT" blue
                // colors: ['#356A99', '#356A99', '#356A99'],
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
            //The below properties are watched separately for changes.

            //Series object (optional) - a list of series using normal Highcharts series options.
            series: [
                {
                    name: 'Page Views',
                    type: 'column',
                    data: dataViews
                }
            ],
            //Title configuration (optional)
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            //Boolean to control showing loading status on chart (optional)
            //Could be a string if you want to show specific loading text.
            loading: false,
            //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
            //properties currentMin and currentMax provided 2-way binding to the chart's maximum and minimum
            xAxis: {
                categories: dataDates,
                currentMin: 0,
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Views'
                }
            }
        };
    }

    function setPageViewsChart() {
        // The pie chart seems to be having trouble with one of these values...
        // per https://github.wwt.com/custom-apps/dev-tool-belt/issues/347
        // Removing the "hit" if the views can't be converted to an int seems to do the trick.
        _.remove(vm.pageViewData, function (it) {
            return !it['ga:pagePath'] || !parseInt(it['ga:pageviews']);
        });

        var dataPageViews = _.map(vm.pageViewData, function (it) {
            return {name: it['ga:pagePath'], y: parseInt(it['ga:pageviews'])};
        });

        vm.pageViewsChartConfig = {

            options: {
                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                //will be overriden by values specified below.

                chart: {
                    type: 'pie',
                    style: {
                        fontFamily: "Proxima Nova, sans-serif"
                    }
                },
                tooltip: {
                    style: {
                        padding: 10,
                        fontWeight: 'bold'
                    }
                },
                // use the following to show vertical legend.
                // legend: {
                //     layout: 'vertical',
                //     backgroundColor: '#FFFFFF',
                //     floating: false,
                //     align: 'right',
                //     verticalAlign: 'top',
                //     itemStyle: {
                //         fontWeight: 'normal',
                //         fontSize: '15px'
                //     },
                //     labelFormatter: function () {
                //         return this.name.substring(0, 30) + ' ' + $filter('number')(this.y);
                //     },
                // },
                // plotOptions: {
                //     pie: {
                //         allowPointSelect: true,
                //         cursor: 'pointer',
                //         dataLabels: {
                //             enabled: false
                //         },
                //         showInLegend: true
                //     }
                // },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        dataLabels: {
                            style: {
                                fontWeight: 'normal',
                                color: '#A3A4A5',
                                textShadow: '0 0',
                                contrast: '0 0'
                            },
                            formatter: function () {
                                return this.key.substring(0, 30) + ' ' + $filter('number')(this.y);
                            },
                        }
                    }
                },
            },

            //The below properties are watched separately for changes.

            //Series object (optional) - a list of series using normal Highcharts series options.
            series: [
                {
                    name: 'Views',
                    type: 'pie',
                    data: dataPageViews
                }
            ],
            //Title configuration (optional)
            title: {
                text: ''
            },
            credits: {
                enabled: false
            }
        };
    }

    function showAllAnalyticsUsers() {
        vm.showAllUsers = !vm.showAllUsers;
    }

    function getLimitTo() {
        if ((vm.userData && vm.userData.length < 21) || vm.showAllUsers) {
            return;
        } else {
            vm.showAllUsersToggle = true;
            return 16;
        }
    }

    // set default child state
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'applicationDetail.analytics') {
            $state.go('.pageViews');
        }
    });
}