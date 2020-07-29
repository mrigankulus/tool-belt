appModule.controller('TaskTypeNotificationsCtrl', makeTaskTypeNotificationsCtrl)

function makeTaskTypeNotificationsCtrl($scope, resourcesAPI) {
    var vm = this

    vm.openType = openType
    vm.hasCustomTemplate = hasCustomTemplate

    init()

    function init() {
        if (!_.get($scope.TaskType, 'taskType')) return
        vm.taskType = $scope.TaskType.taskType
        loadEventTypes()
    }

    function loadEventTypes() {
        resourcesAPI.getEventTypeByResourceType('task').then(function (response) {
            vm.eventTypes = _.filter(response.data, function (type) {
                return !type.id.includes('default-type-') && !type.pauseNotifications
            });

            openType(vm.eventTypes[0])
        });
    }

    function openType(eventType) {
        vm.activeEventType = eventType
        vm.activeTemplate = _.find(eventType.templates, function (template) {
            return _.get(template, 'condition.value') === vm.taskType.id &&
                    _.includes(template.method, 'email')
        })

        if (!vm.activeTemplate) {
            // show the default. the view should prevent editing the default.
            vm.activeTemplate = _.find(eventType.templates, function (template) {
                return !_.get(template, 'condition.value') &&
                        _.includes(template.method, 'email')
            })
        }
    }

    function hasCustomTemplate(eventType) {
        return _.find(eventType.templates, function (template) {
            return _.get(template, 'condition.value') === vm.taskType.id &&
                    _.includes(template.method, 'email')
        })
    }
}