appModule.controller('EventTypeComposeCtrl', makeEventTypeComposeCtrl);

function makeEventTypeComposeCtrl($scope, resourcesAPI, $stateParams, $timeout, googleAnalytics, hotkeys, notificationsAPI, wwtFocusPanelSVC, $q, featureFlagsSVC) {
    var vm = this;

    vm.update = update;
    vm.closeTokenForms = closeTokenForms;
    vm.addToken = addToken;
    vm.saveToken = saveToken;
    vm.updateToken = updateToken;
    vm.deleteToken = deleteToken;
    vm.resetSearchInput = resetSearchInput;
    vm.closePauseNotificationsForms = closePauseNotificationsForms;
    vm.pauseNotifications = pauseNotifications;
    vm.resumeNotifications = resumeNotifications;
    vm.hasReceiptTemplate = hasReceiptTemplate;
    vm.createReceiptTemplate = createReceiptTemplate;
    vm.removeReceipt = removeReceipt;
    vm.copyTokenToAllEvents = copyTokenToAllEvents;
    vm.shouldShowSmsTemplate = shouldShowSmsTemplate
    vm.shouldShowSmsTemplateBody = shouldShowSmsTemplateBody
    vm.addSmsTemplate = addSmsTemplate
    vm.removeSmsTemplate = removeSmsTemplate

    vm.shouldShowFeedTemplateBody = shouldShowFeedTemplateBody
    vm.addFeedTemplate = addFeedTemplate
    vm.removeFeedTemplate = removeFeedTemplate

    vm.shouldShowEmailTemplateBody = shouldShowEmailTemplateBody
    vm.addEmailTemplate = addEmailTemplate
    vm.removeEmailTemplate = removeEmailTemplate

    vm.prepNewEmailTemplate = prepNewEmailTemplate
    vm.setEmailTemplateAsActive = setEmailTemplateAsActive
    vm.getActiveEmailTemplate = getActiveEmailTemplate
    vm.eventTypeIsInvalid = eventTypeIsInvalid
    vm.deleteEmailTemplate = deleteEmailTemplate
    vm.validateEmailTemplateId = validateEmailTemplateId

    init();

    $scope.$watch('EventTypeDetail.eventType.tokens', mergeDefaultTokens);

    function init() {
        resourcesAPI.getEventType($stateParams.id).then(function (response) {
            vm.smallContentTemplate = _.find(response.data.templates, function (it) {
                return _.find(_.get(it, 'method'), function (method) {
                    return method === 'inApp';
                });
            });

            vm.feedContentTemplate = _.find(response.data.templates, function (it) {
                return _.find(_.get(it, 'method'), function (method) {
                    return method === 'feed';
                });
            });

            vm.smsContentTemplate = _.find(response.data.templates, function (it) {
                return _.find(_.get(it, 'method'), function (method) {
                    return method === 'sms';
                });
            });

            vm.emailContentTemplates = _.filter(response.data.templates, function (it) {
                return _.find(_.get(it, 'method'), function (method) {
                    return method === 'email';
                });
            });

            var detaultEmailTemplate = _.find(vm.emailContentTemplates, function (it) {
                return _.find(_.get(it, 'method'), function (method) {
                    return method === 'email' && !it._id
                });
            })

            _.set(detaultEmailTemplate, 'uiState.isDefault', true)
            _.set(detaultEmailTemplate, 'uiState.isActiveInView', true)

            vm.receiptContentTemplate = _.find(response.data.templates, {id: 'receipt'});
        });

        notificationsAPI.getDefaultTokens().then(function (response) {
            var defaultTokens = response.data;
            defaultTokens.forEach(function (it) {
                it.isDefault = true;
            });

            vm.defaultTokens = defaultTokens;
            mergeDefaultTokens();
        });
    }

    function mergeDefaultTokens() {
        if (!$scope.EventTypeDetail.eventType || !vm.defaultTokens) {
            vm.allTokens = [];
            return;
        }

        vm.allTokens = vm.defaultTokens.concat($scope.EventTypeDetail.eventType.tokens);
    }

    function update() {
        vm.isWorking = true;

        vm.smallContentTemplate.content = stripTags(vm.smallContentTemplate.content);

        if (_.get(vm.feedContentTemplate, 'subject')) {
            vm.feedContentTemplate.subject = stripTags(vm.feedContentTemplate.subject);
        }

        if (_.get(vm.feedContentTemplate, 'content')) {
            vm.feedContentTemplate.content = stripAttributes(vm.feedContentTemplate.content);
        }

        if (vm.feedContentTemplate) {
            $scope.EventTypeDetail.eventType.templates.unshift(vm.feedContentTemplate)
        }

        $scope.EventTypeDetail.eventType.templates = [vm.smallContentTemplate];

        if (_.size(vm.emailContentTemplates)) {
            vm.emailContentTemplates.forEach(function (it) {
                $scope.EventTypeDetail.eventType.templates.push(it)
            })
        }


        if (vm.smsContentTemplate) {
            vm.smsContentTemplate.content = stripTags(vm.smsContentTemplate.content);
            $scope.EventTypeDetail.eventType.templates.unshift(vm.smsContentTemplate)
        }

        $scope.EventTypeDetail.eventType.templates.unshift(vm.feedContentTemplate)

        if (hasReceiptTemplate()) {
            $scope.EventTypeDetail.eventType.templates.push(vm.receiptContentTemplate);
        }

        // clean nulls
        _.remove($scope.EventTypeDetail.eventType.templates, function (template) {
            return !_.get(template, 'content') && !_.get(template, 'subject')
        })

        resourcesAPI.updateEventType($scope.EventTypeDetail.eventType).then(function () {
            vm.isWorking = false;
            vm.isFinishedWorking = true;

            $timeout(function () {
                vm.isFinishedWorking = false;
            }, 300);
        });
    }

    function closeTokenForms() {
        vm.isAddingNewToken = false;
        vm.isEditingToken = false;
        vm.isPromptingToDeleteToken = false;
        wwtFocusPanelSVC.closeAllPanels();
    }

    function addToken(newToken) {
        $scope.EventTypeDetail.eventType.tokens.push(_.clone(newToken));
        mergeDefaultTokens();

        update();
        resetAddTokenForm(newToken);
        closeTokenForms();
    }

    function updateToken() {
        update();
        closeTokenForms();
        mergeDefaultTokens();
    }

    function saveToken(token) {
        if (token.isNew) {
            token.isNew = false;
            addToken(token);
        } else {
            updateToken();
        }
    }

    function resetAddTokenForm(newToken) {
        newToken.tokenName = '';
        newToken.propertyPath = '';
        newToken.tokenFilter = '';
    }

    function deleteToken(token) {
        _.remove($scope.EventTypeDetail.eventType.tokens, function (it) {
            return token.tokenName === it.tokenName;
        });

        closeTokenForms();
        mergeDefaultTokens();
    }

    function resetSearchInput() {
        vm.searchTokens = '';
    }

    function closePauseNotificationsForms() {
        vm.isPromptingToPauseNotification = false;
        vm.isPromptingToResumeNotification = false;
    }

    function pauseNotifications() {
        vm.isNotificationsPaused = true;
        $scope.EventTypeDetail.eventType.pauseNotifications = true;

        googleAnalytics.trackEvent('Event Type Actions', 'Notifications Disabled',
            $scope.EventTypeDetail.eventType.title + ' (id: ' + $scope.EventTypeDetail.eventType.id + ')');

        update();
        closePauseNotificationsForms();

    }

    function resumeNotifications() {
        vm.isNotificationsPaused = false;
        $scope.EventTypeDetail.eventType.pauseNotifications = false;

        googleAnalytics.trackEvent('Event Type Actions', 'Notifications Resumed',
            $scope.EventTypeDetail.eventType.title + ' (id: ' + $scope.EventTypeDetail.eventType.id + ')');

        update();
        closePauseNotificationsForms();
    }

    function stripTags(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }

    function stripAttributes(text) {
        // used to remove styles, classes, and IDs from feed content
        var wrapper = document.createElement('div')
        wrapper.innerHTML = text
        walkDOM(wrapper, function(el) {
            if(el.removeAttribute) {
                el.removeAttribute('id')
                el.removeAttribute('style')
                el.removeAttribute('class')
            }
        })

        return wrapper.innerHTML || text
    }

    function walkDOM(node, func) {
        func(node)
        node = node.firstChild
        while (node) {
            walkDOM(node, func)
            node = node.nextSibling
        }
    }

    function hasReceiptTemplate() {
        return vm.receiptContentTemplate;
    }

    function createReceiptTemplate() {
        vm.receiptContentTemplate = receiptTemplate();

        if (!_.find($scope.EventTypeDetail.eventType.tokens, {tokenName: 'actorUserName'})) {
            $scope.EventTypeDetail.eventType.tokens.push({
                tokenName: 'actorUserName',
                propertyPath: 'actorUser.userName',
                isEventTime: true
            });

            mergeDefaultTokens();
        }
    }

    function receiptTemplate() {
        return {
            id: 'receipt',
            content: "You're action has been processed.",
            subject: "You're action has been processed.",
            // todo: can we ditch this audience? just needed it here to get it to work with the api.
            audience: [
                'internal'
            ],
            // todo: this isn't used for anything, but it's needed to get it to save in the api.
            method: [
                'receipt'
            ]
        }
    }

    function copyTokenToAllEvents(token) {
        if (!token || !token.tokenName || !token.propertyPath) {
            return;
        }

        var requests = [];
        var eventTypes = _.cloneDeep($scope.EventTypeDetail.eventType.resourceType.eventTypes);

        var allEventTypes = _.map(eventTypes, function (eventType) {
            if (!eventType) {
                return;
            }

            if (!eventType.tokens) {
                eventType.tokens = [];
            }

            var matchingToken = _.find(eventType.tokens, {tokenName: token.tokenName});

            if (matchingToken) {
                _.forIn(matchingToken, function (value, key) {
                    matchingToken[key] = token[key];
                })
            } else {
                eventType.tokens.push(token);
            }

            // needed for the api to handle the update
            if (!eventType.resourceType) {
                eventType.resourceType = $scope.EventTypeDetail.eventType.resourceType;
            }

            requests.push(resourcesAPI.updateEventType(eventType));

            return eventType;
        });

        $q.all(requests).then(function (responses) {
            closeTokenForms();
        });
    }

    function removeReceipt() {
        vm.receiptContentTemplate = '';
        _.remove($scope.EventTypeDetail.eventType.templates, {id: 'receipt'});
        update();
    }

    function shouldShowSmsTemplate() {
        return featureFlagsSVC.flagIsActive('smsEventTemplates')
    }

    function shouldShowSmsTemplateBody() {
        return _.get(vm.smsContentTemplate, 'content') || _.get(vm, 'isAddingSmsContent')
    }

    function addSmsTemplate() {
        vm.isAddingSmsContent = true
        if (!vm.smsContentTemplate) {
            vm.smsContentTemplate = {
                id: 'Internal-Sms',
                method: ['sms'],
                audience: ['internal']
            }
        }
    }

    function removeSmsTemplate() {
        vm.isAddingSmsContent = false

        delete vm.smsContentTemplate

        _.remove($scope.EventTypeDetail.eventType.templates, function (it) {
            return it.method === 'sms'
        })
    }

    function shouldShowFeedTemplateBody() {
        return _.get(vm.feedContentTemplate, 'content') || _.get(vm.feedContentTemplate, 'subject') || _.get(vm, 'isAddingFeedContent')
    }

    function addFeedTemplate() {
        vm.isAddingFeedContent = true
        if (!vm.feedContentTemplate) {
            vm.feedContentTemplate = {
                id: 'Internal-Feed',
                method: ['feed'],
                audience: ['internal']
            }
        }
    }

    function removeFeedTemplate() {
        vm.isAddingFeedContent = false

        delete vm.feedContentTemplate

        _.remove($scope.EventTypeDetail.eventType.templates, function (it) {
            return it.method === 'feed'
        })
    }

    function shouldShowEmailTemplateBody() {
        return _.size(vm.emailContentTemplates) || _.get(vm, 'isAddingEmailContent')
    }

    function addEmailTemplate() {
        vm.isAddingEmailContent = true
        if (!_.size(vm.emailContentTemplates)) {
            vm.emailContentTemplates = [{
                id: 'Internal-Email',
                method: ['email'],
                audience: ['internal'],
                uiState: {
                    isDefault: true,
                    isActiveInView: true
                }
            }]
        }
    }

    function removeEmailTemplate() {
        vm.isAddingEmailContent = false

        delete vm.emailContentTemplate
        delete vm.emailContentTemplates

        _.remove($scope.EventTypeDetail.eventType.templates, function (it) {
            return it.method === 'email'
        })
    }

    function prepNewEmailTemplate() {
        var template = {
            _id: 'new',
            method: ['email'],
            audience: ['all']
        }

        vm.emailContentTemplates.push(template)

        setEmailTemplateAsActive(template)
    }

    function setEmailTemplateAsActive(template) {
        if (!vm.emailContentTemplates) {
            return
        }

        vm.emailContentTemplates.forEach(function (it) {
            _.set(it, 'uiState.isActiveInView', false)
        })

        _.set(template, 'uiState.isActiveInView', true)
    }

    function getActiveEmailTemplate() {
        if (!_.size(vm.emailContentTemplates)) {
            return
        }

        return vm.emailContentTemplates.find(function (it) {
            return _.get(it, 'uiState.isActiveInView')
        })
    }

    function eventTypeIsInvalid() {
        return _.some(vm.emailContentTemplates, function (it) {
            return !it.id || it.id === 'new'
        })
    }

    function deleteEmailTemplate(id) {
        _.remove(vm.emailContentTemplates, function (it) {
            return it._id === id
        })

        var defaultTemplate = _.find(vm.emailContentTemplates, function (it) {
            return _.get(it, 'uiState.isDefault')
        })

        if (defaultTemplate) {
            setEmailTemplateAsActive(defaultTemplate)
        }

        update()
    }

    function validateEmailTemplateId(template) {
        if (_.get(template, 'uiState.isDefault')) {
            return ''
        }

        if (!_.get(template, '_id')) {
            template._id = 'new'
        }

        template._id = slugifyText(template._id)


        if (_.size(_.filter(vm.emailContentTemplates, {_id: template._id})) > 1) {
            template._id += '-1'
        }
    }

    function slugifyText(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    hotkeys.bindTo($scope)
        .add({
            combo: ['command+s', 'ctrl+s'],
            description: 'Save Settings',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function (event, hotkey) {
                event.preventDefault();
                update();
            }
        });

}