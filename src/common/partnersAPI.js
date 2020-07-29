appModule.factory('partnersAPI', makePartnersAPI);

function makePartnersAPI($http, $q, wwtEnv, profileEvents, userEvents, CacheFactory, usersAPI) {
    var partnersAPI = {};

    var cacheKeyProfileByPartner = 'profileByPartnerCache';

    CacheFactory(cacheKeyProfileByPartner, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    function clearProfileByPartnerCache(response) {
        CacheFactory.get(cacheKeyProfileByPartner).removeAll();
        return response;
    }

    partnersAPI.searchPartners = function (term) {
        var requests = [
            $http.get(wwtEnv.getApiForwardUrl() + '/partner/customers?fuzzy=name&includeInactive=N&name=' + term),
            $http.get(wwtEnv.getApiForwardUrl() + '/partner/vendors?fuzzy=name&includeInactive=N&name=' + term),
            $http.get(wwtEnv.getApiForwardUrl() + '/partner/manufacturers?fuzzy=name&includeInactive=N&name=' + term)
        ];

        var formattedResponses = [];

        return $q.all(requests).then(function (responses) {
            responses.forEach(function (response, index) {
                var partnerType = ''

                if (index === 0) {
                    partnerType = 'customer'
                }

                if (index === 1) {
                    partnerType = 'vendor'
                }

                if (index === 2) {
                    partnerType = 'manufacturer'
                }

                response.data.forEach(function (partner) {
                    partner.type = partnerType
                    formattedResponses.push(partner)
                })
            });

            return {
                data: formattedResponses
            }
        });
    };

    partnersAPI.getPartnerById = function (partnerId) {
        var config = {
            willHandleErrors: true,
            partnerId: partnerId
        };

        return $http.get(wwtEnv.getApiForwardUrl() + '/partner/customers/' + partnerId, config).then(function (response) {
            return response;
        }).catch(function () {
            return $http.get(wwtEnv.getApiForwardUrl() + '/partner/vendors/' + partnerId, config).then(function (response) {
                return response;
            }).catch(function () {
                return $http.get(wwtEnv.getApiForwardUrl() + '/partner/manufacturers/' + partnerId, config).then(function (response) {
                    return response
                }).catch(function () {
                    return $q.when('')
                })
            });
        });
    };

    partnersAPI.addPartnerToProfile = function (partner, profile) {
        var data = {
            id: partner.id,
            type: partner.type.toLowerCase()
        };

        return $http.post(wwtEnv.getApiForwardUrl() + '/resources/associations/user-security-profile/' + profile.id + '?pageSize=500', data).then(function (response) {
            clearProfileByPartnerCache(response);

            return profileEvents.partnerAddedToProfile(partner, profile).then(function () {
                return response;
            });
        });
    };

    partnersAPI.removePartnerFromProfile = function (partner, profile) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/resources/associations/' + partner.associationId + '?pageSize=500').then(function (response) {
            clearProfileByPartnerCache(response);

            return profileEvents.partnerRemovedFromProfile(partner, profile).then(function () {
                return response;
            });
        });
    };

    partnersAPI.getProfilesForPartner = function (partner) {
        // page size of 50 is the max
        var formattedResponse = {data: []},
            assocIds = [];

        return $http.get(wwtEnv.getApiForwardUrl() + '/resources/associations/' + partner.type.toLowerCase() + '/' + partner.partnerGroupId + '?pageSize=500&type=user-security-profile&embedded=false', {cache: CacheFactory.get(cacheKeyProfileByPartner)}).then(function (response) {
            if (!response || !response.data || !response.data['user-security-profile'] || !response.data['user-security-profile'].data || !response.data['user-security-profile'].data.data.length) {
                return formattedResponse;
            }

            function pushError(err) {
                return err;
            }

            var profileRequests = _.map(response.data['user-security-profile'].data.data, function (association) {
                assocIds.push(association.id);
                var profileResource = _.find(association.resources, {type: 'user-security-profile'});

                return $http.get(wwtEnv.getApiForwardUrl() + '/profiles/' + profileResource.id).catch(pushError);
            });

            if (!profileRequests || !profileRequests.length) {
                return formattedResponse;
            }

            return $q.all(profileRequests).then(function (responses) {
                formattedResponse.data = _.map(responses, function (response, index) {
                    response.data.associationId = assocIds[index];
                    return response.data;
                });

                return formattedResponse;
            });
        });
    };

    partnersAPI.addProfileToPartner = function (profile, partner) {
        var data = {
            id: profile.id,
            type: 'user-security-profile'
        };

        return $http.post(wwtEnv.getApiForwardUrl() + '/resources/associations/' + partner.type.toLowerCase() + '/' + partner.partnerGroupId + '?pageSize=500', data).then(function (response) {
            clearProfileByPartnerCache(response);

            return profileEvents.profileAddedToPartner(partner, profile).then(function () {
                return response;
            });

        });
    };

    partnersAPI.addUserToPartner = function (user, partner) {
        var userAssociation = {
            id: user.id,
            type: 'user'
        };

        return $http.post(wwtEnv.getApiForwardUrl() + '/resources/associations/' + partner.type.toLowerCase() + '/' + partner.partnerGroupId + '?pageSize=500', userAssociation).then(function (response) {
            CacheFactory.get(usersAPI.cacheKeyUserByPartnerId).removeAll();

            return userEvents.userAddedToPartner(user, partner).then(function () {
                return response;
            });

        });

    };

    partnersAPI.addPartnerToUser = function (user, partner) {
        var userAssociation = {
            id: partner.partnerGroupId,
            type: partner.type.toLowerCase()
        };

        return $http.post(wwtEnv.getApiForwardUrl() + '/resources/associations/user/' + user.wwtUserId + '?pageSize=500', userAssociation).then(function (response) {
            CacheFactory.get(usersAPI.cacheKeyUserByPartnerId).removeAll();

            CacheFactory.get(usersAPI.cacheKeyPartnerByUserId).removeAll();

            return userEvents.userAddedToPartner(user, partner).then(function () {
                return response;
            });

        });

    };

    partnersAPI.removeProfileFromPartner = function (profile, partner) {
        return $http.delete(wwtEnv.getApiForwardUrl() + '/resources/associations/' + profile.associationId + '?pageSize=500').then(function (response) {
            clearProfileByPartnerCache(response);

            return profileEvents.profileRemovedFromPartner(partner, profile).then(function () {
                return response;
            });
        });
    };

    partnersAPI.getPartnersForProfile = function (profileId) {

        var partnerTypes = ['customer', 'vendor', 'manufacturer']

        var requests = []

        partnerTypes.forEach(function (partnerType) {
            requests.push(partnersAPI.getPartnersOfTypeForProfile(profileId, partnerType))
        })

        return $q.all(requests).then(function (responses) {
            var partners = _.map(responses, function (response) {
                return response.data
            })

            return {
                data: _.flatten(partners)
            }
        })
    };

    partnersAPI.getPartnersOfTypeForProfile = function (profileId, partnerType) {
        // pretty much taking the logic from https://github.wwt.com/custom-apps/profilemanagement/pull/18/files
        // this seems pretty straightforward...getting association data and mapping it together.
        var partnerIds = [];
        var assocIds = [];
        var partners = [];

        var profileAssociatesUrl = wwtEnv.getApiForwardUrl() + '/resources/associations/user-security-profile/' + profileId + '?type=' + partnerType + '&embedded=false';

        return $http.get(profileAssociatesUrl).then(function (response) {
            if (!response || !response.data || !response.data[partnerType] || !response.data[partnerType].data || !response.data[partnerType].data.data.length) {
                return {data: []}
            }

            response.data[partnerType].data.data.forEach(function (d) {
                if (d.resources) {
                    var localIds = d.resources.filter(function (r) {
                        return r.type === partnerType;
                    }).map(function (c) {
                        assocIds.push(d.id);
                        return c.id;
                    });
                    partnerIds.push(localIds);
                }
            });

            var partnerRequests = [];

            partnerIds.forEach(function (ci) {
                if (ci && ci != 'undefined') {
                    partnerRequests.push(partnersAPI.getPartnerById(ci))
                }
            });

            return $q.all(partnerRequests).then(function (responses) {
                responses.forEach(function (response, idx) {
                    if (_.get(response, 'config.partnerId') && _.get(response, 'data.name')) {
                        partners.push({
                            id: response.config.partnerId[0],
                            name: response.data.name,
                            type: response.data.type.toLowerCase(),
                            associationId: assocIds[idx]
                        });
                    }
                });

                // returning a format similar to a typical $http request for consistency upstream
                return {
                    data: partners
                }
            });

        });
    }

    return partnersAPI;
}
