appModule.factory('Member', memberFactory)

function memberFactory(wwtEnv, $http, $cacheFactory) {
    var Member = function (member) {
        var self = this

        _.forIn(member, function (value, key) {
            self[key] = value
        })
    }

    Member.prototype.update = function () {
        var self = this
        var groupId = _.get(self, 'inheritedFromGroup.id') || self.groupId
        var url = wwtEnv.getApiForwardUrl() + '/groups/' + groupId + '/members/' + self.wwtUserId
        return $http.put(url, self).then(clearGroupCache).catch(function (err) {
            return
        })
    }

    Member.prototype.isAdmin = function () {
        return _.get(this, 'memberType') === 'admin'
    }

    function clearGroupCache(response) {
        var $httpDefaultCache = $cacheFactory.get('$http')
        $httpDefaultCache.removeAll()
        return response
    }

    return Member
}