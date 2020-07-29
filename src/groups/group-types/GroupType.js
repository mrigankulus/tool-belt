appModule.factory('GroupType', groupTypeFactory)

function groupTypeFactory(wwtEnv, $http, $cacheFactory) {
    var apiUrl = wwtEnv.getApiRouterUrl() + '/group-types'

    var GroupType = function (groupType) {
        var self = this

        _.forIn(groupType, function (value, key) {
            self[key] = value
        })
    }

    GroupType.findById = function (typeId) {
        var config = {
            willHandleErrors: true,
            params: {embed: 'groups'}
        }

        return $http.get(apiUrl + '/' + typeId, config).then(function (response) {
            response.data = new GroupType(response.data)
            return response
        })
    }

    GroupType.find = function (query) {
        if (!query) {
            query = {}
        }

        if (!query.embed) {
            query.embed = 'groups'
        }

        var config = {
            cache: true,
            willHandleErrors: true,
            params: query
        }

        return $http.get(apiUrl, config).then(function (response) {
            response.data = _.map(response.data, function (groupType) {
                return new GroupType(groupType)
            })
            return response
        })
    }

    GroupType.create = function (groupType) {
        return $http.post(apiUrl, groupType).then(clearGroupCache).then(function (response) {
            response.data = new GroupType(response.data)
            return response
        })
    }

    GroupType.prototype.getIntegrationJobs = function () {
        var self = this
        var url = wwtEnv.getApiRouterUrl() + '/group-integrations/' + self.id
        return $http.get(url, {willHandleErrors: true})
    }

    GroupType.prototype.delete = function () {
        var self = this
        var url = apiUrl + '/' + self.id
        return $http.delete(url).then(clearGroupCache)
    }

    GroupType.prototype.update = function (updatedGroupType) {
        var url = apiUrl + '/' + this.id
        return $http.put(url, updatedGroupType).then(clearGroupCache)
    }

    function clearGroupCache(response) {
        var $httpDefaultCache = $cacheFactory.get('$http')
        $httpDefaultCache.removeAll()
        return response
    }

    return GroupType
}