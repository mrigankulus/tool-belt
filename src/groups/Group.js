appModule.factory('Group', groupFactory)

function groupFactory(wwtEnv, $http, Member, $cacheFactory) {
    var apiUrl = wwtEnv.getApiRouterUrl() + '/groups'
    var apiUrlReadOnly = wwtEnv.getApiRouterUrl() + '/readonly-groups'

    var Group = function (group, inheritedMembers) {
        var self = this

        if (!group) {
            return
        }

        if (_.size(group.members)) {
            group.members = _.map(group.members, function (it) {
                // pass the group id into the member so
                // updates to member are easy
                it.groupId = group.id
                return new Member(it)
            })
        }

        if (_.size(inheritedMembers)) {
            // this makes it easier to see all the members in each group
            // from the org call. We don't get this from the api because the api
            // will only give us inherited members on a single group.
            inheritedMembers.forEach(it => {
                if (!_.find(group.members, {wwtUserId: it.wwtUserId})) {
                    group.members.push(it)
                }
            })
        }

        _.forIn(group, function (value, key) {
            self[key] = value
        })

        if (_.size(self.groups)) {
            self.groups = _.map(self.groups, function(subGroup) {
                return new Group(subGroup, group.members)
            })
        }

        if (self.path) {
            self.pathArray = _.chain(self.path)
                                .split(',')
                                .compact()
                                .uniq()
                                .value()
        }
    }

    Group.findById = function (groupId, options) {
        return $http.get(apiUrlReadOnly + '/' + groupId, {willHandleErrors: true, params: options}).then(function (response) {
            response.data = new Group(response.data)
            return response
        })
    }

    Group.find = function (query) {
        return $http.get(apiUrlReadOnly, {params: query, cache: true, willHandleErrors: true}).then(function (response) {
            if (response.data && response.data.docs) {
                response.data.docs = _.map(response.data.docs, function (group) {
                    return new Group(group)
                })
            }
            return response
        })
    }

    Group.create = function (group) {
        return $http.post(apiUrl, group).then(clearGroupCache).then(function (response) {
            response.data = new Group(response.data)
            return response
        })
    }

    Group.createSubGroup = function (group, parentGroupId) {
        return Group.create(group).then(clearGroupCache).then(function (response) {
            return $http.post(apiUrl + '/' + parentGroupId + '/groups', {id: response.data.id}).then(function () {
                response.data = new Group(response.data)
                return response
            })
        })
    }

    Group.titleIsValid = function (title, id) {
        if (!id) {
            id = _.kebabCase(title)
        }

        return Group.findById(id).then(function () {
            return
        }).catch(function (err) {
            return err.status === 404
        })
    }

    Group.prototype.delete = function () {
        var self = this
        var url = groupsUrl + '/' + self.id
        return $http.delete(url).then(clearGroupCache)
    }

    Group.prototype.markAsMember = function (member) {
        var self = this
        var groupId = _.get(member, 'inheritedFromGroup.id') || self.id
        member.memberType = 'member'
        var url = apiUrl + '/' + groupId + '/members/' + member.wwtUserId
        return $http.put(url, member).then(clearGroupCache)
    }

    Group.prototype.markAsAdmin = function (member) {
        var self = this
        var groupId = _.get(member, 'inheritedFromGroup.id') || self.id
        member.memberType = 'admin'
        var url = apiUrl + '/' + groupId + '/members/' + member.wwtUserId
        return $http.put(url, member).then(clearGroupCache)
    }

    Group.prototype.update = function (updatedGroup) {
        var url = apiUrl + '/' + this.id
        return $http.put(url, updatedGroup).then(clearGroupCache)
    }

    Group.prototype.addUser = function (user) {
        var self = this

        user.wwtUserId = user.id
        var url = apiUrl + '/' + self.id + '/members'
        return $http.post(url, user).then(clearGroupCache).then(function (response) {
            if (!_.get(user, 'memberType')) {
                user.memberType = 'member'
            }

            user.groupId = self.id

            self.members.push(new Member(user))
            return response
        }).catch(function (err) {
            return
        })
    }

    Group.prototype.removeUser = function (member) {
        var self = this
        var groupId = _.get(member, 'inheritedFromGroup.id') || self.id
        var url = apiUrl + '/' + groupId + '/members/' + member.wwtUserId
        return $http.delete(url, {willHandleErrors: true}).then(clearGroupCache).then(function () {
            _.remove(self.members, {wwtUserId: member.wwtUserId})
        }).catch(function (err) {
            return
        })
    }

    Group.prototype.addGroup = function (groupId) {
        var self = this

        var url = apiUrl + '/' + self.id + '/groups'
        return $http.post(url, {id: groupId}).then(clearGroupCache).then(function (response) {
            if (!self.groups) {
                self.groups = []
            }

            self.groups.push(response.data)
            return response
        })
    }

    function clearGroupCache(response) {
        var $httpDefaultCache = $cacheFactory.get('$http')
        $httpDefaultCache.removeAll()
        return response
    }

    return Group
}