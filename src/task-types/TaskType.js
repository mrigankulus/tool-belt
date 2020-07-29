appModule.factory('TaskType', TaskTypeFactor)

function TaskTypeFactor(wwtEnv, $http, WwtTask) {
    var apiUrl = wwtEnv.getApiRouterUrl() + '/task-types'

    var TaskType = function (taskType) {
        var self = this

        _.forIn(taskType, function (value, key) {
            self[key] = value
        })
    }

    TaskType.find = function () {
        return $http.get(apiUrl).then(function (response) {
            response.data = _.map(response.data, function (it) {
                return new TaskType(it)
            })
            return response
        })
    }

    TaskType.findById = function (id) {
        return $http.get(apiUrl + '/' + id).then(function (response) {
            response.data = new TaskType(response.data)
            return response
        })
    }

    TaskType.create = function (taskType) {
        return $http.post(apiUrl, taskType).then(function (response) {
            response.data = new TaskType(response.data)
            return response
        })
    }

    TaskType.prototype.update = function () {
        var self = this
        return $http.put(apiUrl + '/' + self.id, self)
    }

    TaskType.prototype.delete = function () {
        var self = this
        return $http.delete(apiUrl + '/' + self.id)
    }

    TaskType.prototype.listTasks = function (query) {
        var self = this
        if (!query) query = {}
        query.taskType = self.id
        query.anyAssignedUser = true
        query.limit = 25
        query.page = 1

        return WwtTask.find(query)
    }

    TaskType.prototype.disableNotificationsForEventType = function (eventTypeId) {
        var self = this

        if (!self.disableNotificationsForEventIds) self.disableNotificationsForEventIds = []
        self.disableNotificationsForEventIds.push(eventTypeId)

        return self.update()
    }

    TaskType.prototype.enableNotificationsForEventType = function (eventTypeId) {
        var self = this

        if (!self.disableNotificationsForEventIds) return
        _.remove(self.disableNotificationsForEventIds, function (it) {
            return it === eventTypeId
        })

        return self.update()
    }

    TaskType.prototype.toggleEventIsDisabled = function (eventTypeId) {
        var self = this
        if (self.eventIsDisabled(eventTypeId)) {
            return self.enableNotificationsForEventType(eventTypeId)
        }
        return self.disableNotificationsForEventType(eventTypeId)
    }

    TaskType.prototype.eventIsDisabled = function (eventTypeId) {
        var self = this

        if (!self.disableNotificationsForEventIds) return
        return self.disableNotificationsForEventIds.indexOf(eventTypeId) > -1
    }

    return TaskType
}