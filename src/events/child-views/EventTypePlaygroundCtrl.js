appModule.controller('EventTypePlaygroundCtrl', makeEventTypePlaygroundCtrl);

function makeEventTypePlaygroundCtrl($scope, $timeout, $stateParams, $q, resourcesAPI, notificationsAPI, amqpEventsAPI, wwtUser, usersAPI, AfChart, $http, wwtEnv, envExtended, appsAPI, groupsApi) {
    var vm = this;

    vm.propIsObject = propIsObject;
    vm.sendTest = sendTest;
    vm.getTestUrl = getTestUrl;
    vm.onUpdateToken = onUpdateToken;
    vm.getSubscribers = getSubscribers;
    vm.prefillTokens = prefillTokens;
    vm.searchUsersReturningUserNames = searchUsersReturningUserNames;
    vm.searchUsersForApprovalRequest = searchUsersForApprovalRequest;
    vm.searchUsersForApprovalRequestedBy = searchUsersForApprovalRequestedBy;
    vm.addAChart = addAChart;
    vm.addMetaGroup = addMetaGroup;
    vm.searchProfiles = searchProfiles;
    vm.getGroups = getGroups;

    init();

    $scope.envExtended = envExtended
    $scope.$watch('EventTypePlayground.requiredTokenData', onTokenDataChange, true)
    $scope.$watch('EventTypePlayground.requiredTokenData.embeds', updateEmbeds, true)

    vm.openDatePicker = openDatePicker
    vm.datePickers = []
    vm.dateOptions = {
        formatYear: 'yy',
        initDate: new Date(),
        showWeeks: false
    }

    function init() {
        vm.isLongLoad = false;

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true;
        }, 700);

        wwtUser.getCurrentUser().then(function (response) {
            vm.currentUser = response.data
        })

        resourcesAPI.getEventTypeById($stateParams.id).then(function (response) {
            $timeout.cancel(loadTimer);
            vm.isLongLoad = false;

            vm.eventType = response.data;
            vm.message = {};

            vm.eventType.tokens.push({
                tokenName: 'resourceId',
                propertyPath: vm.eventType.pathToResourceId
            });

            convertEventTokensToObject(vm.eventType.tokens);
        });
    }

    function convertEventTokensToObject(tokens) {
        // Given "test.this.conversion", we want to create {test: {this: {conversion: ""}}}
        var requiredTokenData = {};

        if (!vm.requiredTokenData) {
            vm.requiredTokenData = {};
        }

        tokens.forEach(function (it) {
            _.set(requiredTokenData, it.propertyPath, it.value)
        });

        vm.requiredTokenData = Object.assign(vm.requiredTokenData, requiredTokenData);
    }

    function propIsObject(prop) {
        return typeof prop === 'object';
    }

    function sendTest() {
        vm.isSendingTest = true;
        vm.messageSent = false;
        cleanEmptyArrays(vm.requiredTokenData);
        var tokenData = _.cloneDeep(vm.requiredTokenData)

        subscribeCurrentUser().then(function () {
            // not going through the amqpEventsApi so we can have more control over the actor user here.
            $http.post(wwtEnv.getApiForwardUrl() + '/events/' + vm.eventType.amqpExchange + '/' + encodeURIComponent(vm.eventType.amqpRoutingKey), _.cloneDeep(tokenData)).then(function () {
                vm.isSendingTest = false;
                vm.messageSent = true;
            })
        });

    }

    function cleanEmptyArrays(obj) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object") {
                    cleanEmptyArrays(obj[property]);
                }

                if (_.isArray(obj[property]) && !_.size(obj[property])) {
                    delete obj[property]
                }
            }
        }
    }

    function getTestUrl() {
        return amqpEventsAPI.apiUrl + '/' + vm.eventType.amqpExchange + '/' + encodeURIComponent(vm.eventType.amqpRoutingKey);
    }

    function onUpdateToken(token) {
        convertEventTokensToObject(vm.eventType.tokens);

        if (token.tokenName === 'resourceId') {
            getSubscribers();
        }
    }

    function prefillTokens() {
        vm.eventType.tokens.forEach(function (token) {
            token.value = 'test';
            onUpdateToken(token);
        });
    }

    function userIsSubscribed(wwtUserId) {
        return vm.subscribers && _.find(vm.subscribers, function (it) {
            return it.wwtUserId === wwtUserId;
        });
    }

    function subscribeCurrentUser() {
        if (userIsSubscribed(vm.currentUser.wwtUserId)) {
            return $q.when(true);
        }

        var resourceToken = _.find(vm.eventType.tokens, function (it) {
            return it.tokenName === 'resourceId';
        });

        var resourceId = resourceToken.value;

        return notificationsAPI.subscribeUserToEventTypeResource(vm.eventType.resourceType.id, resourceId, vm.eventType.id, vm.currentUser.wwtUserId).then(function (response) {
            vm.subscribers.push(response.data);
        });
    }

    function getSubscribers() {
        var resourceId,
            resourceToken;

        vm.subscribers = [];

        resourceToken = _.find(vm.eventType.tokens, function (it) {
            return it.tokenName === 'resourceId';
        });

        resourceId = resourceToken.value;

        if (!resourceId) {
            return $q.when();
        }

        return notificationsAPI.getEventTypeSubscribersForResource(vm.eventType.resourceType.id, resourceId, vm.eventType.id, vm.requiredTokenData).then(function (response) {
            vm.subscribers = response.data;

            if (!_.isEmpty(_.get(vm.requiredTokenData, 'targetUsers.subscriberUserNames'))) {
                _.get(vm.requiredTokenData, 'targetUsers.subscriberUserNames').forEach(function (it) {
                    vm.subscribers.push({userName: it})
                })

                // vm.subscribers = vm.subscribers.concat(vm.subscriberUserNames);
                // remove dupes
                vm.subscribers.forEach(function (user, index) {
                    if (_.filter(vm.subscribers, {userName: _.get(user, 'userName')}).length > 1) {
                        _.remove(vm.subscribers, function (it, i) {
                            return i === index;
                        });
                    }
                });
            }

            // if notification should restrict to users
            if (!_.isEmpty(_.get(vm.requiredTokenData, 'targetUsers.restrictToUserNames'))) {
                _.remove(vm.subscribers, function (user) {
                    return !vm.requiredTokenData.targetUsers.restrictToUserNames.includes(_.get(user, 'userName'))
                });
            }

            setNotifiedUsersText()
        });
    }

    function searchUsersReturningUserNames(searchText) {
        if (searchText && searchText.length > 1) {
            usersAPI.findUserBySearchTerm(searchText).then(function (response) {
                vm.availableUsers = _.map(response.data, function (it) {
                    return _.get(it, 'userName')
                })
            });
        } else {
            vm.availableUsers = [];
        }
    }

    function searchUsersForApprovalRequest(searchText) {
        if (searchText && searchText.length > 1) {
            usersAPI.findUserBySearchTerm(searchText).then(function (response) {
                vm.availableUsers = _.map(response.data, function (it) {
                    return {userName: _.get(it, 'userName')}
                })
            });
        } else {
            vm.availableUsers = [];
        }
    }

    function searchUsersForApprovalRequestedBy(searchText) {
        if (searchText && searchText.length > 1) {
            usersAPI.findUserBySearchTerm(searchText).then(function (response) {
                vm.availableUsers = _.map(response.data, function (it) {
                    return {
                        userName: _.get(it, 'userName'),
                        wwtUserId: _.get(it, 'wwtUserId')
                    }
                })
            });
        } else {
            vm.availableUsers = [];
        }
    }

    function onTokenDataChange() {
        if (!vm.requiredTokenData) {
            return;
        }

        // todo: we need this to clear empty arrays after some properties
        // have been cleared. But it causes a bug when adding new array properties.
        // For example, if you added subscriber users, then add one time email addresses.
        // cleanEmptyArrays(vm.requiredTokenData)
        getSubscribers()
    }

    function addAChart() {
        var chart = {
            type: 'column',
            labels: ['Label 1', 'Label 2'],
            data: [25, 60]
        }

        if (!_.get(vm.requiredTokenData, 'embeds.charts')) {
            _.set(vm.requiredTokenData, 'embeds.charts')

            vm.requiredTokenData.embeds.charts = []
        }

        vm.requiredTokenData.embeds.charts.push(chart)

        updateEmbeds()
    }

    function addMetaGroup() {
        if (!_.get(vm.requiredTokenData, 'embeds.metaDataGroups')) {
            _.set(vm.requiredTokenData, 'embeds.metaDataGroups')

            vm.requiredTokenData.embeds.metaDataGroups = []
        }

        vm.requiredTokenData.embeds.metaDataGroups.push({
            title: 'Meta Data is Good',
            data: [
                {
                    title: 'This is a title.',
                    value: ['This could be a simple value, or a list.']
                }
            ]
        })

        updateEmbeds()
    }

    function updateEmbeds() {
        // we need to copy this out to a new property so the preview
        // data doesn't get the added data from <af-embeds>
        vm.embeds = ''

        if (!vm.requiredTokenData) {
            return
        }

        $timeout(function () {
            vm.embeds = _.cloneDeep(vm.requiredTokenData.embeds);

            if (_.get(vm.embeds, 'charts')) {
                vm.embeds.charts = _.map(vm.embeds.charts, function (chart) {
                    return new AfChart(chart)
                })
            }
        })
    }

    function setNotifiedUsersText() {
        vm.subscribersText = ''

        if (!vm.currentUser) {
            return
        }

        var subscribers = _.cloneDeep(vm.subscribers)

        var currentUserSubscription = _.remove(subscribers, function (it) {
            return _.get(it, 'userName') === vm.currentUser.userName
        })

        vm.notifiedUsersText = ''

        currentUserCanBeNotified().then(function (canNotifyCurrentUser) {
            if (canNotifyCurrentUser) {
                vm.notifiedUsersText += '<b>You</b>'
            }

            if (subscribers.length) {
                if (canNotifyCurrentUser) {
                    vm.notifiedUsersText += ' and '
                }

                vm.notifiedUsersText += '<b>' + subscribers.length + '</b> other'

                if (subscribers.length > 1) {
                    vm.notifiedUsersText += 's'
                }
            }

            if (!vm.notifiedUsersText) {
                vm.notifiedUsersText = ''
                vm.notifiedUsersText = '<b>No</b> users'
            }

            vm.notifiedUsersText += ' will be notified.'
        })
    }

    function currentUserCanBeNotified() {
        vm.shouldShowUserSettingsWarning = false

        if (!_.isEmpty(_.get(vm.requiredTokenData, 'targetUsers.restrictToUserNames'))) {
            if (!vm.requiredTokenData.targetUsers.restrictToUserNames.includes(vm.currentUser.userName)) {
                return $q.when(false)
            }
        }

        if (_.get($scope.EventTypeDetail, 'eventType.allowActorUserNotification')) {
            return $q.when(true)
        }

        var actorIsCurrentUser = _.get(vm.requiredTokenData, 'actorUser.userName') == _.get(vm.currentUser, 'userName')

        if (!actorIsCurrentUser) {
            return $q.when(true)
        }

        return notificationsAPI.getUserSettings().then(function (response) {
            var canBeNotified = actorIsCurrentUser && _.get(response.data, 'notifyMeOfMyActions')
            vm.shouldShowUserSettingsWarning = !canBeNotified
            return canBeNotified
        })
    }

    function searchProfiles() {
        appsAPI.getAllProfiles().then(function (response) {
            vm.availableProfiles = response.data
        })
    }

    function getGroups() {
        groupsApi.getGroups().then(function (response) {
            vm.availableGroups = response.data
        })
    }

    function openDatePicker(index) {
        if (!vm.datePickers[index]) {
            vm.datePickers[index] = {}
        }
        vm.datePickers[index].opened = true
    }
}