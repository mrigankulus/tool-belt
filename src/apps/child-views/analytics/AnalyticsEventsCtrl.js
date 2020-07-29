appModule.controller('AnalyticsEventsCtrl', makeAnalyticsEventsCtrl);

function makeAnalyticsEventsCtrl($scope, $timeout) {
    var vm = this;

    vm.starterErrorDisplayLimit = 20;
    vm.currentlyErrorDisplayedLimit = vm.starterErrorDisplayLimit;
    vm.showMoreErrors = showMoreErrors;
    vm.shouldShowMoreButtonForErrors = shouldShowMoreButtonForErrors;

    $scope.$watch('ApplicationAnalytics.eventsByDateData', init, true);

    function init() {
        vm.categories = [];
        vm.actions = [];
        vm.labels = [];

        vm.selectCategory = selectCategory;
        vm.selectAction = selectAction;

        vm.mainChart = {
            x: [],
            y: []
        };

        if (!$scope.ApplicationAnalytics.eventsByDateData) {
            return;
        }

        vm.data = $scope.ApplicationAnalytics.eventsByDateData;
        setCats();
        setDefaults();
        setChart();

        vm.jsErrors = $scope.ApplicationAnalytics.javascriptErrorData;
    }

    function setCats() {
        vm.groupedByCat = _.groupBy(vm.data, 'ga:eventCategory');

        _.forIn(vm.groupedByCat, function (events, key) {
            vm.categories.push(key);
        });
    }

    function setDefaults() {
        vm.mainChart.x.length = 0;
        vm.mainChart.y.length = 0;

        var dataEventCounts = [];

        _.forIn(vm.groupedByCat, function (events, key) {
            vm.mainChart.x.push(key);

            var groupCount = 0;

            events.forEach(function (it) {
                groupCount += parseInt(it['ga:totalEvents']);
            });

            vm.mainChart.y.push(groupCount);
        });
    }

    function selectCategory(category) {
        vm.activeAction = '';
        vm.actions = [];

        if (!category) {
            setDefaults();
            return;
        }

        $timeout(function () {

            vm.mainChart.x.length = 0;
            vm.mainChart.y.length = 0;

            var dataSet = vm.groupedByCat[category];
            var groupedByAction = _.groupBy(dataSet, 'ga:eventAction');

            var dataEventCounts = [];

            _.forIn(groupedByAction, function (events, key) {

                vm.actions.push(key);
                vm.mainChart.x.push(key);

                var groupCount = 0;

                events.forEach(function (it) {
                    groupCount += parseInt(it['ga:totalEvents']);
                });

                vm.mainChart.y.push(groupCount);
            });

        });

    }

    function selectAction(action) {
        var category = vm.activeCategory;

        if (!action) {
            selectCategory(vm.activeCategory);
            return;
        }

        $timeout(function () {

            vm.mainChart.x.length = 0;
            vm.mainChart.y.length = 0;

            var catGroup = vm.groupedByCat[category];
            var groupedByAction = _.groupBy(catGroup, 'ga:eventAction');
            var dataSet = groupedByAction[action];

            var groupedByLabel = _.groupBy(dataSet, 'ga:eventLabel');

            var dataEventCounts = [];

            _.forIn(groupedByLabel, function (events, key) {
                vm.mainChart.x.push(key);

                var groupCount = 0;

                events.forEach(function (it) {
                    groupCount += parseInt(it['ga:totalEvents']);
                });

                vm.mainChart.y.push(groupCount);
            });

        });

    }

    function setChart() {
        vm.chartConfig = {
            options: {
                colors: ['#7CB5EC', '#7CB5EC', '#7CB5EC'],
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
                    name: 'Events',
                    type: 'column',
                    data: vm.mainChart.y
                }
            ],
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            loading: false,
            xAxis: {
                categories: vm.mainChart.x,
                currentMin: 0,
                title: {
                    text: 'Categories'
                }
            },
            yAxis: {
                title: {
                    text: 'Events'
                }
            }
        };
    }

    function shouldShowMoreButtonForErrors() {
        return vm.jsErrors && vm.jsErrors.length > vm.currentlyErrorDisplayedLimit;
    }

    function showMoreErrors() {
        vm.currentlyErrorDisplayedLimit += vm.starterErrorDisplayLimit;
    }
}