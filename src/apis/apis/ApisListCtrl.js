appModule.controller('ApisListCtrl', makeApisListCtrl);

function makeApisListCtrl($scope, $timeout, $http, wwtEnv, apisAPI, userPermissionsAPI, wwtFocusPanelSVC, recentlyViewed) {
    var vm = this;

    vm.searchFilter = searchFilter;
    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showAllApis = showAllApis;
    vm.sortApisByScore = sortApisByScore;
    vm.filterApiListByScore = filterApiListByScore;
    vm.clearApiListFilters = clearApiListFilters;
    vm.filterApisByScore = filterApisByScore;
    vm.showMore = showMore;
    vm.apisLimit = 24;
    vm.allScoreApis;
    vm.filtersActivated = false;
    vm.scoreSortActivated = false;
    vm.scoreSortDirectionAsc = false;
    vm.env = wwtEnv.getEnv();

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;

    var SPLUNK_STORAGE_KEY = 'dtb-hide-api-splunk-report'

    var scorecardCategories = {
        'application-crash': 2,
        'application-exception': .1,
        'application-docs-insecure': 10,
        'application-get-insecure': 1,
        'application-post-insecure': 20,
        'application-put-insecure': 20
    }

    vm.scoreFilters = [
        {
            title: 'Good Scores',
            type: 'green',
            active: true,
            count: 0
        },
        {
            title: 'Ok Scores',
            type: 'yellow',
            active: true,
            count: 0
        },
        {
            title: 'Bad Scores',
            type: 'red',
            active: true,
            count: 0
        }
    ];

    init();

    function init() {
        apisAPI.getLatestApis().then(function (response) {
            vm.apis = response.data;
            var apiList = response.data
            getApiScores().then(function (apiScores) {
                vm.scoreFilters.forEach(function (element) {
                    element.count = 0
                    return element
                })
                vm.apis = apiList.map(function (api) {
                    api.scoreCard = {}
                    var validScore = apiScores.filter(element => element.route.id == api.id)
                    if (validScore[0] && validScore.length != 0) {
                        api.scoreCard.totalScore = validScore[0].scorecard.total.points
                        if (api.scoreCard.totalScore <= 10) {
                            api.scoreCard.totalScoreColor = 'green'
                            vm.scoreFilters[0].count++
                        } else if (api.scoreCard.totalScore <= 30) {
                            api.scoreCard.totalScoreColor = 'yellow'
                            vm.scoreFilters[1].count++
                        } else {
                            api.scoreCard.totalScoreColor = 'red'
                            vm.scoreFilters[2].count++
                        }
                    } else {
                        api.scoreCard.totalScore = 0
                        api.scoreCard.totalScoreColor = 'green'
                    }
                    return api
                })
            })
            vm.allScoreApis = vm.apis

            $timeout(function () {
                $scope.apis = vm.apis
                recentlyViewed.get('apis', vm.apis).then(function (recentResponse) {
                    vm.recentApis = recentResponse.data
                    vm.allScoreRecentApis = vm.recentApis
                    setAllOverrides()
                })
            }, 300)
        });

        userPermissionsAPI.canEditApis().then(function (response) {
            vm.canEditApis = response;
        });

        apisAPI.getOverridesForUser().then(function (response) {
            vm.overridesForUser = response.data;
        });
    }

    function getApiScores() {
        return $http.get(wwtEnv.getApiRouterUrl() + '/endpoint-security-reports', {
            params: {
                select: 'id,route,talliedAnalytics,updatedOn,scorecard'
            }
        }).then(function (response) {
            if (!response.data) {
                return []
            }
            return response.data
        })
    }

    function showAllApis() {
        vm.apis = vm.allScoreApis;
    }

    function sortApisByScore(scoreColor) {
        if (scoreColor == 'all') {
            vm.apis = vm.allScoreApis
            vm.recentApis = vm.allScoreRecentApis
        } else {
            let filteredApis = vm.allScoreApis.filter(function (api) {
                return api.scoreCard.totalScoreColor == scoreColor
            })
            let filteredRecentApis = vm.allScoreRecentApis.filter(function (api) {
                return api.scoreCard.totalScoreColor == scoreColor
            })

            vm.apis = filteredApis
            vm.recentApis = filteredRecentApis
        }
    }

    function filterApisByScore() {
        var activeFilters = _.filter(vm.scoreFilters, { active: true });
        if (!activeFilters || !activeFilters.length) {
            vm.apis = []
            vm.recentApis = []
            return;
        }

        var validScoreColors = []
        vm.filtersActivated = true
        activeFilters.forEach(function (element) {
            validScoreColors.push(element.type)
        })

        let filteredApis = vm.allScoreApis.filter(function (api) {
            if (validScoreColors.includes(api.scoreCard.totalScoreColor)) {
                return api
            }
        })
        let filteredRecentApis = vm.allScoreRecentApis.filter(function (api) {
            if (validScoreColors.includes(api.scoreCard.totalScoreColor)) {
                return api
            }
        })
        vm.apis = filteredApis
        vm.recentApis = filteredRecentApis

        if(vm.scoreScortActivated == true) {
            filterApiListByScore()
        }

    }

    function filterApiListByScore() {
        vm.filtersActivated = true
        vm.scoreSortDirectionDesc = false
        vm.apis.sort(function (a, b) {
            return a.scoreCard.totalScore - b.scoreCard.totalScore
        })
        vm.recentApis.sort(function (a, b) {
            return a.scoreCard.totalScore - b.scoreCard.totalScore
        })
        if(!vm.scoreSortDirectionAsc) {
            vm.scoreSortDirectionDesc = true
            vm.recentApis.reverse()
            vm.apis.reverse()
        }
    }

    function clearApiListFilters() {
        vm.scoreFilters.forEach(function(element) {
            element.active = true
            return element
        })
        vm.nameSortDirectionDesc = false
        vm.scoreSortDirectionDesc = false
        vm.filtersActivated = false
        vm.scoreSortActivated = false;
       init();
    }

    function setAllOverrides() {
        return apisAPI.getAllOverrides().then(function (overridesResponse) {
            vm.apis.forEach(function (api) {
                api.activeOverrides = _.filter(overridesResponse.data, function (override) {
                    return _.get(override, 'apiId') === _.get(api, 'id') && override.isEnabledFlag
                })
            })

            vm.recentApis.forEach(function (api) {
                api.activeOverrides = _.filter(overridesResponse.data, function (override) {
                    return _.get(override, 'apiId') === _.get(api, 'id') && override.isEnabledFlag
                })
            })
        })
    }

    function searchTextHasMatch(api) {
        var searchText = vm.apiSearchText ? vm.apiSearchText.toLowerCase() : '';

        if (!searchText) {
            return true;
        }

        return (api.apiName.toLowerCase().indexOf(searchText) > - 1) ||
            (api.description ? api.description.indexOf(searchText) > - 1 : false) ||
            (api.routePrefix && api.routePrefix.toLowerCase().indexOf(searchText) > - 1)
    }

    function searchFilter(api) {
        return searchTextHasMatch(api) &&
            (vm.isFilteringByOverrides ? findOverrideFromApi(api) : true);
    }

    function shouldShowShowMore() {
        return vm.apis && !vm.apiSearchText && (vm.apis.length > vm.apisLimit);
    }

    function showMore() {
        vm.apisLimit += vm.apis.length;
    }

    function findOverrideFromApi(api) {
        if (!api || !vm.overridesForUser || !vm.overridesForUser.length) {
            return false;
        }

        return _.find(vm.overridesForUser, { 'apiId': api.id });
    }
}
