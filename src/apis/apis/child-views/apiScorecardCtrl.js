appModule.controller('APIScorecardCtrl', makeAPIScorecardCtrl)

function makeAPIScorecardCtrl($scope, $state, $timeout, WwtNgSocketChannel, apisAPI, wwtFocusPanelSVC, $rootScope, wwtEnv) {
    const vm = this

    vm.scoresLoaded = false
    vm.totalScore = 0
    vm.getValue = getValue
    vm.getScoreColor = getScoreColor
    vm.deleteException = deleteException
    vm.getUniqueAlerts = getUniqueAlerts
    vm.reRunReport = reRunReport
    vm.newException = newException
    vm.addException = addException
    vm.createException = createException

    const scorecardCategories = {
        'application-crash': 2,
        'application-exception': .1,
        'application-docs-insecure': 10,
        'application-get-insecure': 1,
        'application-post-insecure': 20,
        'application-put-insecure': 20
    }

    vm.exceptionCreatedFlag = false
    vm.isPromptingToDeleteException = false
    vm.scores = {}
    vm.scoreData = {}
    vm.allUrlAlerts = []
    vm.allUrlExceptions = []
    vm.isProcessingReport = false
    vm.isEditingException = {}
    vm.showAlert = true
    vm.showDetails = false
    vm.addAlertToException = addAlertToException
    vm.editException = editException
    $scope.chosenMethod
    $scope.availableMethods = [
        'GET',
        'POST',
        'PUT'
    ]
    vm.apiDat = {}

    vm.apiId = $state.params.id

    $scope.wwtFocusPanelSVC = wwtFocusPanelSVC;

    init();

    function init() {
        vm.totalScore = 0
        var env = wwtEnv.getEnv()

        if (env === 'prd' || env === 'prod') {
            vm.shouldShowBlankSlate = true
        } else {
            vm.shouldShowBlankSlate = false
        }

        apisAPI.getApiById($state.params.id).then(function (response) {

            vm.apiData = response.data
            var channel = new WwtNgSocketChannel('wwt.scanRoute.create.status', $scope)
            channel.onMessage = function (eventData) {
                $timeout(function () {

                    if (eventData.data.payload.route.routePrefix == vm.apiData.routePrefix && eventData.data.payload.status == 'processing') {
                        vm.isProcessingReport = true
                    } else if (eventData.data.payload.route.routePrefix == vm.apiData.routePrefix && eventData.data.payload.status == 'complete') {
                        vm.isProcessingReport = false
                        getAllApiScores();
                        getAllApiExceptions();
                    }
                });
            }
        })

        getAllApiScores();
        getAllApiExceptions();
    }

    function addException() {
        if (vm.isEditingException.isAddingNewException == true) {
            let dataBody = vm.isEditingException
            dataBody.apiId = vm.apiId
            apisAPI.createException(dataBody).then(function (response) {
                vm.exceptionCreatedFlag = true
                vm.allUrlExceptions.push(response.data)
                return
            })
        } else {
            let dataBody = vm.isEditingException
            dataBody.apiId = vm.apiId
            apisAPI.updateException(vm.apiId, dataBody).then(function (response) {
                vm.exceptionCreatedFlag = true
                return
            })
        }
        return
    }

    function createException(isEditingException) {
        let dataBody = isEditingException
        apisAPI.createException(dataBody).then(function (response) {
            getAllApiExceptions();
            return
        })
    }

    function addAlertToException(alert) {
        vm.isEditingException = alert;
        vm.isEditingException.urlPathPattern = alert.url;
        vm.isPromptingToDeleteException = false;
        vm.isEditingException.isAddingNewException = true;
    }

    function editException(exception) {
        vm.isEditingException = exception;
        vm.isPromptingToDeleteException = false;
        vm.isEditingException.isAddingNewException = false;
    }

    function getAllApiScores() {
        apisAPI.getApiReport($state.params.id).then(function (response) {
            if (response.length == 0) {
                initializeAllToZero();
                return
            }
            vm.scoreData = response[0]
            vm.lastUpdatedOn = moment(vm.scoreData.updatedOn).format('MMMM Do YYYY, h:mm:ss a')
            vm.totalScore = vm.scoreData.scorecard.total.points
            vm.scorecard = vm.scoreData.scorecard
            vm.getRequestCount = vm.scorecard.route.insecureGetRequests.count
            vm.getRequestPoints = vm.scorecard.route.insecureGetRequests.points
            vm.postRequestCount = vm.scorecard.route.insecurePostRequests.count
            vm.postRequestPoints = vm.scorecard.route.insecurePostRequests.points
            vm.putRequestCount = vm.scorecard.route.insecurePutRequests.count
            vm.putRequestPoints = vm.scorecard.route.insecurePutRequests.points
            vm.deleteRequestCount = vm.scorecard.route.insecureDeleteRequests.count
            vm.deleteRequestPoints = vm.scorecard.route.insecureDeleteRequests.points
            vm.insecureDocumentationCount = vm.scorecard.application.insecureDocumentation.count
            vm.insecureDocumentationPoints = vm.scorecard.application.insecureDocumentation.points
            vm.applicationErrorCount = vm.scorecard.application.errors.count
            vm.applicationErrorPoints = vm.scorecard.application.errors.points
            vm.applicationCrashCount = vm.scorecard.application.crashes.count
            vm.applicationCrashPoints = vm.scorecard.application.crashes.points

            var getRequestErrors = getUniqueAlerts(vm.scoreData.detailedAnalytics.route.insecureGetRequests)
            var postRequestErrors = getUniqueAlerts(vm.scoreData.detailedAnalytics.route.insecurePostRequests)
            var putRequestErrors = getUniqueAlerts(vm.scoreData.detailedAnalytics.route.insecurePutRequests)
            var deleteRequestErrors = getUniqueAlerts(vm.scoreData.detailedAnalytics.route.insecureDeleteRequests)
            vm.allUrlAlerts = getRequestErrors.concat(putRequestErrors, postRequestErrors, deleteRequestErrors)
        })
        return
    }

    function initializeAllToZero() {
        vm.apiNotAccountedFor = true
        vm.getRequestCount = '-'
        vm.getRequestPoints = '-'
        vm.postRequestCount = '-'
        vm.postRequestPoints = '-'
        vm.putRequestCount = '-'
        vm.putRequestPoints = '-'
        vm.deleteRequestCount = '-'
        vm.deleteRequestPoints = '-'
        vm.insecureDocumentationCount = '-'
        vm.insecureDocumentationPoints = '-'
        vm.applicationErrorCount = '-'
        vm.applicationErrorPoints = '-'
        vm.applicationCrashCount = '-'
        vm.applicationCrashPoints = '-'
        vm.totalScore = '-'
        vm.lastUpdatedOn = 'N/A'
    }

    function getAllApiExceptions() {
        apisAPI.getApiExceptions($state.params.id).then(function (response) {
            vm.allUrlExceptions = getUniqueExceptions(response)
        })
        return
    }

    function newException(exception) {
        vm.allUrlExceptions.push(exception)
        return
    }

    function getValue(category) {
        return scorecardCategories[category]
    }

    function reRunReport() {
        vm.exceptionCreatedFlag = false
        vm.apiNotAccountedFor = false
        return apisAPI.reRunApiReport($state.params.id)
    }

    function getUniqueAlerts(alertArray) {
        if (alertArray.length <= 0) {
            return []
        }
        let resArray = []
        let x = alertArray.filter(function (item) {
            let i = resArray.findIndex(x => x.url == item.url && x.method == item.method)
            if (i <= -1) {
                if (item.method == "GET") {
                    item.methodColor = 'blue'
                } else if (item.method == "POST") {
                    item.methodColor = 'green'
                } else if (item.method == "PUT") {
                    item.methodColor = 'orange'
                }
                if (item.requestBody) {
                    item.requestBody = JSON.parse(item.requestBody)
                } else {
                    item.requestBody = {}
                }
                resArray.push(item)
            }
            return null
        })
        return resArray
    }

    function getUniqueExceptions(alertArray) {
        if (alertArray.length <= 0) {
            return []
        }
        let resArray = []
        let x = alertArray.filter(function (item) {
            let i = resArray.findIndex(x => x.urlPathPattern == item.urlPathPattern && x.method == item.method)
            if (i <= -1) {
                if (item.method == "GET") {
                    item.methodColor = 'blue'
                } else if (item.method == "POST") {
                    item.methodColor = 'green'
                } else if (item.method == "PUT") {
                    item.methodColor = 'orange'
                }
                if (item.requestBody) {
                    item.requestBody = JSON.parse(item.requestBody)
                } else {
                    item.requestBody = {}
                }
                resArray.push(item)
            }
            return null
        })
        return resArray
    }

    function deleteException() {
        vm.isPromptingToDeleteException = false
        vm.exceptionCreatedFlag = true
        let index = vm.allUrlExceptions.indexOf(vm.isEditingException)
        if (index > -1) {
            vm.allUrlExceptions.splice(index, 1)
        }
        return apisAPI.deleteException(vm.isEditingException.id)
    }

    function getScoreColor() {
        if (vm.totalScore <= 10) {
            return 'green'
        } else if (vm.totalScore <= 30) {
            return 'yellow'
        } else {
            return 'red'
        }
    }
}
