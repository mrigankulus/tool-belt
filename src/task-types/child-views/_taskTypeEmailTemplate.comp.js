appModule.component('taskTypeEmailTemplate', {
    templateUrl: 'task-types/child-views/_taskTypeEmailTemplate.html',
    controller: TaskTypeEmailTemplateCtrl,
    bindings: {
        eventType: '<',
        template: '<',
        taskType: '<'
    }
})

function TaskTypeEmailTemplateCtrl(resourcesAPI, notificationsAPI) {
    var vm = this

    vm.isDefault = isDefault
    vm.stubCustom = stubCustom
    vm.deleteTemplate = deleteTemplate
    vm.update = update

    init()

    function init() {
        notificationsAPI.getDefaultTokens().then(function (response) {
            var defaultTokens = response.data
            defaultTokens.forEach(function (it) {
                it.isDefault = true
            })

            vm.defaultTokens = defaultTokens;
            vm.allTokens = defaultTokens.concat(vm.eventType.tokens)
        });
    }

    function stubCustom() {
        vm.isWorking = true
        if (!vm.eventType || !vm.template) return

        var template = _.clone(vm.template)
        template._id = slugifyText(vm.taskType.id)
        template.method = ['email']
        template.audience = ['all']
        template.condition = {
            value: vm.taskType.id,
            operator: '==',
            tokenPath: 'taskType.id'
        }

        resourcesAPI.addTemplateToEventType(vm.eventType.id, template).then(function (response) {
            vm.eventType.templates.push(response.data)
            vm.template = response.data
            vm.isWorking = false
        })
    }

    function deleteTemplate() {
        if (!vm.template.condition) throw new Error('Cannot delete the default template.')
        resourcesAPI.deleteTemplate(vm.eventType.id, vm.template._id).then(function (response) {
            // set back to the default
            vm.template = _.find(vm.eventType.templates, function (template) {
                return !_.get(template, 'condition.value') && _.includes(template.method, 'email')
            })
        })
    }

    function update() {
        vm.isWorking = true
        if (!vm.template.condition) throw new Error('Cannot update the default template.')
        resourcesAPI.updateTemplate(vm.eventType.id, vm.template).then(function (response) {
            vm.isWorking = false
        })
    }

    function slugifyText(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    function isDefault() {
        return !_.get(vm.template, 'condition')
    }
}
