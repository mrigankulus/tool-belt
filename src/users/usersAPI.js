appModule.factory('usersAPI', makeusersAPI);

function makeusersAPI($http, $q, wwtEnv, CacheFactory, userEvents, registrationAPI, Upload) {
    var api = {};

    api.cacheKeyPartnerByUserId = 'partnerByUserIdCache'

    api.cacheKeyUserByPartnerId = 'userByPartnerIdCache'

    CacheFactory(api.cacheKeyUserByPartnerId, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory(api.cacheKeyPartnerByUserId, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    function clearUserByPartnerIdCache(response) {
        CacheFactory.get(api.cacheKeyUserByPartnerId).removeAll();
        return response;
    }

    function clearPartnerByUserIdCache(response) {
        CacheFactory.get(api.cacheKeyPartnerByUserId).removeAll();
        return response;
    }

    api.apiURL = wwtEnv.getApiForwardUrl() + '/users';

    api.findUserBySearchTerm = function (searchTerm) {
        var url = api.apiURL + '?fullName=' + searchTerm + '&fuzzy=fullName&max=35&sort=lastName,firstName';
        var userNameUrl = api.apiURL + '?userName=' + searchTerm + '&fuzzy=userName&max=35&sort=userName';
        var userIdUrl = api.apiURL + '/' + searchTerm;

        var requests = [$http.get(url), $http.get(userNameUrl)]

        if (!isNaN(searchTerm)) {
            requests.push($http.get(userIdUrl))
        }

        return $q.all(requests).then(function (responses) {
            var allResults = responses[0].data || [];

            responses[1].data.forEach(function (it) {
                if (!_.find(allResults, {id: it.id})) {
                    allResults.push(it);
                }
            });

            if (responses[2] && responses[2].data) {
                if (!_.find(allResults, {id: responses[2].data.id})) {
                    allResults.push(responses[2].data);
                }
            }

            return {
                data: allResults
            }
        });
    };

    api.getUsersByUserNames = function (userNames) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/users/?userName=' + userNames.join(',') );
    };

    api.getUserById = function (userName) {
        // this doesn't work. it just pulls the current user.
        return $http.get(wwtEnv.getApiForwardUrl() + '/users/?userName=' + userName + '&objectType=full');
    };

    api.getUserByWwtUserId = function (wwtUserId) {
        // this doesn't work. it just pulls the current user.
        return $http.get(wwtEnv.getApiForwardUrl() + '/users/' + wwtUserId + '?objectType=full' );
    };

    api.getUsersByIds = function (commaSeparatedUserNames) {
        if (!commaSeparatedUserNames) return $q.when({data: []})
        return $http.get(wwtEnv.getApiForwardUrl() + '/users/?userName=' + commaSeparatedUserNames + '&objectType=full');
    };

    api.addUser = function (newUser, shouldInvite) {
        return $http.post(api.apiURL, newUser).then(function (response) {
            if (shouldInvite) {
                return registrationAPI.generatePin(response.data.userName, 'setup').then(function () {
                    clearUserByPartnerIdCache();
                    return response;
                });

            } else {
                clearUserByPartnerIdCache();
                return response
            }
        });
    };

    api.updateUser = function (user) {
        return $http.put(wwtEnv.getApiForwardUrl() + '/users/' + user.id, user).then(clearUserByPartnerIdCache);
    };

    api.addUsers = function (newUsers, shouldInvite) {
        newUsers = _.cloneDeep(newUsers);

        var requests = [];

        newUsers.forEach(function (newUser) {
            requests.push(api.addUser(newUser, shouldInvite));
        });

        return $q.all(requests);
    };

    api.getUsersByPartner = function (partner) {
        // page size of 50 is the max
        var formattedResponse = {data: []}

        var associationUrl = wwtEnv.getApiForwardUrl() + '/resources/associations/' + partner.type.toLowerCase() + '/' + partner.partnerGroupId
        var associationRequestConfig = {
            cache: CacheFactory.get(api.cacheKeyUserByPartnerId),
            params: {
                pageSize: 500,
                type: 'user',
                embedded: false
            }
        }

        return $http.get(associationUrl, associationRequestConfig).then(function (assocResponse) {
            if (!_.size(_.get(assocResponse, 'data.user.data.data'))) {
                return formattedResponse
            }

            function pushError(err) {
                return err;
            }

            var userIds = _.map(assocResponse.data.user.data.data, function (association) {
                var userResource = _.find(association.resources, {type: 'user'});
                return userResource.id
            });

            if (!_.size(userIds)) {
                return formattedResponse;
            }

            return $http.get(wwtEnv.getApiForwardUrl() + '/users?ids=' + userIds.join(',')).then(function (response) {
                formattedResponse.data = _.map(response.data, function (user, index) {
                    var targetAssociation = _.find(assocResponse.data.user.data.data, function (association) {
                        return _.find(association.resources, function (it) {
                            return it.id == user.id
                        })
                    })

                    if (targetAssociation.id) {
                        user.associationId = targetAssociation.id
                    }

                    return user;
                });

                return formattedResponse;
            });

        });
    };


    api.getPartnersForUserId = function (userId) {
        var partnerTypes = ['customer', 'vendor', 'manufacturer']

        var requests = []

        partnerTypes.forEach(function (partnerType) {
            requests.push(api.getPartnersOfTypeForUserId(userId, partnerType))
        })

        return $q.all(requests).then(function (responses) {
            var partners = _.map(responses, function (response) {
                return response.data
            })

            return {
                data: _.flatten(partners)
            }
        })
    }

    api.removeUserFromPartner = function (user, partner) {
        if (!user.associationId) {
            return $q.reject('association id required')
        }

        return $http.delete(wwtEnv.getApiForwardUrl() + '/resources/associations/' + user.associationId).then(function (response) {
            clearUserByPartnerIdCache(response);

            return userEvents.userRemovedFromPartner(user, partner).then(function () {
                return response;
            });
        })

    }

    api.getPartnersOfTypeForUserId = function (userId, partnerType) {
        var formattedResponse = {data: []},
            assocIds = [];


        return $http.get(wwtEnv.getApiForwardUrl() + '/resources/associations/user/' + userId + '?pageSize=500&type=' + partnerType + '&embedded=false', {cache: CacheFactory.get(api.cacheKeyPartnerByUserId)}).then(function (response) {
            if (!response || !response.data || !response.data[partnerType] || !response.data[partnerType].data || !response.data[partnerType].data.data.length) {
                return formattedResponse;
            }

            function pushError(err) {
                return err;
            }

            var partnerRequests = _.map(response.data[partnerType].data.data, function (association) {
                assocIds.push(association.id);
                var partnerResource = _.find(association.resources, {type: partnerType});

                return $http.get(wwtEnv.getApiForwardUrl() + '/partner/' + partnerType + 's/' + partnerResource.id, {willHandleErrors: true}).catch(pushError);
            });

            if (!partnerRequests || !partnerRequests.length) {
                return formattedResponse;
            }

            return $q.all(partnerRequests).then(function (responses) {
                formattedResponse.data = _.map(responses, function (response, index) {
                    if (!response.data || response.status === 512) {
                        return
                    }

                    response.data.associationId = assocIds[index];
                    return response.data;
                });

                return formattedResponse;
            });

        });
    }

    api.getDefaultAppByUser = function (user) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/user/' + user.userName + '/preferences');
    };

    api.updateUserPreferences = function (userPreferences) {
        if (userPreferences.id == null) {
            return $http.post(wwtEnv.getApiForwardUrl() + '/user/preferences', userPreferences);
        } else {
            $http.put(wwtEnv.getApiForwardUrl() + '/user/preferences/' + userPreferences.id, userPreferences);
        }
    };

    api.uploadImage = function (user, image) {
        var url = wwtEnv.getApiForwardUrl() + '/users/' + user.id + '/profile/picture'

        return Upload.upload({
            url: url,
            data: {file: image}
        })
    }

    api.getExternalUserType = function (user) {

        if (!user) {
            return
        }

        if (user.type) {

            if (user.type === 'proxy') {
                return 'PROXY'
            }

            if (((!user.internal || user.internal == 'N') && user.type === 'svc') || user.internal === 'N' && user.ldapUserId.toLowerCase().indexOf('svc_') === 0) {
                return 'SVC USER'
            } else if ((!user.internal || user.internal == 'N') && user.type !== 'svc') {
                return 'EXTERNAL'
            }
        }

        // attempts to get user type
        if (!user.type) {

            if (api.isExternalUser(user)) {
                return 'EXTERNAL'
            }

            if (api.isSvcUser(user)) {
                return 'SVC USER'
            }
        }
    }

    api.getUserSetPasswordLink = function (user) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/notifications?userId=' + user.userName + '&resourceEventTypeId=password-setup-requested&deliveryMethod=email&select=notificationActions,who&pageSize=1').then(function (response1) {
            return $http.get(wwtEnv.getApiForwardUrl() + '/notifications?userId=' + user.userName + '&resourceEventTypeId=password-reset-requested&deliveryMethod=email&select=notificationActions,who&pageSize=1').then(function (response2) {
                var data = _.sortBy(response1.data.concat(response2.data), 'who.creationDate').reverse()

                response1.data = data
                return response1
            })
        })
    }

    api.isExternalUser = function (user) {
        return _.includes(_.get(user, 'userName'), '@') || _.includes(_.get(user, 'ldapUserId'), '@')
    }

    api.isSvcUser = function (user) {
        return user.userName.toLowerCase().indexOf('svc_') === 0 || (user.ldapUserId && user.ldapUserId.toLowerCase().indexOf('svc_') === 0);
    }

    return api;
}
