appModule.factory('resourcesAPI', makeResourceTypeAPI);

function makeResourceTypeAPI($http, wwtEnv, CacheFactory, $q, notificationsAPI) {
    var api = {};
    var cacheKeyResourceTypes = 'resourceTypesCache',
        cacheKeyEventTypes = 'eventTypesCache',
        cacheKeyEventTypeDetail = 'cacheKeyEventTypeDetail';

    var resourceTypesUrl = wwtEnv.getApiForwardUrl() + '/resource-types'
    var eventTypesUrl = wwtEnv.getApiForwardUrl() + '/event-types'
    var associationsUrl = wwtEnv.getApiForwardUrl() + '/resources/associations'

    CacheFactory(cacheKeyResourceTypes, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory(cacheKeyEventTypes, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    // this one should be quick. Cache is just to prevent
    // superfluous requests.
    CacheFactory(cacheKeyEventTypeDetail, {
        maxAge: 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    function clearResourceTypesCache(response) {
        CacheFactory.get(cacheKeyResourceTypes).removeAll();
        return response;
    }

    function clearEventTypesCache(response) {
        CacheFactory.get(cacheKeyEventTypes).removeAll();
        return response;
    }


    api.getResourceTypes = function () {
        return $http.get(resourceTypesUrl, {cache: CacheFactory.get(cacheKeyResourceTypes)});
    };

    api.restoreResourceType = function (id) {
        return api.createAllDefaultEventsForResourceType(id).then(function () {
            return $http.put(resourceTypesUrl + '/' + id, {deleted: false}).then(clearResourceTypesCache);
        });
    };

    api.restoreEventType = function (id, clearExchange) {
        var updatedType = {deleted: false};

        if (clearExchange) {
            updatedType.amqpExchange = null;
        }

        return $http.put(eventTypesUrl + '/' + id, updatedType).then(clearEventTypesCache);
    };

    api.deleteResourceType = function (id) {
        return api.getResourceType(id).then(function (resourceTypeResponse) {
            return $http.delete(resourceTypesUrl + '/' + id).then(function (deleteResponse) {
                clearResourceTypesCache(deleteResponse);
                var eventTypes = resourceTypeResponse.data.eventTypes;

                if (!eventTypes || !eventTypes.length) {
                    return deleteResponse;
                }

                var requests = [];

                eventTypes.forEach(function (it) {
                    requests.push(api.deleteEventType(it.id));
                });

                return $q.all(eventTypes).then(function (eventTypesDeleteResponse) {
                    return clearEventTypesCache(eventTypesDeleteResponse);
                });
            });
        });
    };

    api.deleteEventType = function (id) {
        return $http.delete(eventTypesUrl + '/' + id).then(clearEventTypesCache);
    };

    api.getEventTypes = function () {
        return $http.get(eventTypesUrl + '?paginate=false', {cache: CacheFactory.get(cacheKeyEventTypes)});
    };

    api.getEventTypeById = function (eventTypeId) {
        return $http.get(eventTypesUrl + '/' + eventTypeId, {cache: CacheFactory.get(cacheKeyEventTypeDetail)});
    };

    api.getEventTypeByResourceType = function (resourceTypeId) {
        return $http.get(resourceTypesUrl + '/' + resourceTypeId + '/event-types/');
    };

    api.getResourceType = function (resourceTypeId) {
        return $http.get(resourceTypesUrl + '/' + resourceTypeId);
    };

    api.getEventType = function (eventTypeId) {
        return $http.get(eventTypesUrl + '/' + eventTypeId, {cache: CacheFactory.get(cacheKeyEventTypeDetail)});
    };

    api.createResourceType = function (newResourceType) {
        return $http.post(resourceTypesUrl, newResourceType).then(function (response) {
            clearResourceTypesCache(response);

            return api.createAllDefaultEventsForResourceType(response.data.id).then(function () {
                return response;
            });

        });
    };

    api.createEventType = function (newEventType) {
        return $http.post(eventTypesUrl, newEventType).then(function (response) {
            clearEventTypesCache(response);
            return response;
        });
    };

    api.addTemplateToEventType = function (eventTypeId, template) {
        return $http.post(eventTypesUrl + '/' + eventTypeId + '/templates', template).then(function (response) {
            clearEventTypesCache(response);
            return response;
        });
    };

    api.deleteTemplate = function (eventTypeId, templateId) {
        return $http.delete(eventTypesUrl + '/' + eventTypeId + '/templates/' + templateId).then(function (response) {
            clearEventTypesCache(response);
            return response;
        });
    };

    api.updateTemplate = function (eventTypeId, template) {
        if (!template._id) throw new Error('A template id is required to update.')
        return $http.put(eventTypesUrl + '/' + eventTypeId + '/templates/' + template._id, template).then(function (response) {
            clearEventTypesCache(response);
            return response;
        });
    };

    api.getAssociations = function (resourceTypeName, resourceId, typeParams) {
        return $http.get(associationsUrl + '/' + resourceTypeName + '/' + resourceId + typeParams);
    };

    api.getAssociationsForResourceType = function (resourceTypeId) {
        return $http.get(associationsUrl + '?baseType=' + resourceTypeId);
    };

    api.updateResourceType = function (resourceType) {
        return $http.put(resourceTypesUrl + '/' + resourceType.id, resourceType).then(function (response) {
            clearResourceTypesCache(response);
            return response;
        });
    };

    api.updateEventType = function (eventType) {
        return $http.put(eventTypesUrl + '/' + eventType.id, eventType).then(function (response) {
            clearEventTypesCache(response);
            return response;
        });
    };

    api.getMergedLogsForEventType = function (eventTypeId, pageNumber) {
        if (!pageNumber) {
            pageNumber = 1
        }

        var eventsUrl = wwtEnv.getApiForwardUrl() + '/resource-audit-events?pageSize=10&resourceEventTypeId=' + eventTypeId + '&pageNumber=' + pageNumber

        return $http.get(eventsUrl).then(function (eventsResponse) {
            var eventIds = eventsResponse.data.map(function (it) {
                return it.id
            })

            if (!_.size(eventIds)) {
                return eventsResponse
            }

            var notificationRequestsUrl = wwtEnv.getApiForwardUrl() + '/notification-requests?pageSize=30&resourceEventIds=' + eventIds.join(',')
            return $http.get(notificationRequestsUrl).then(function (notificationRequestsResponse) {
                eventsResponse.data.forEach(function (event) {
                    event.notificationRequests = notificationRequestsResponse.data.filter(function (request) {
                        return request.resourceEventId === event.id
                    })
                })

                var notificationsUrl = wwtEnv.getApiForwardUrl() + '/notifications?resourceEventIds=' + eventIds.join(',')
                return $http.get(notificationsUrl).then(function (notificationsResponse) {
                    eventsResponse.data.forEach(function (event) {
                        event.notifications = notificationsResponse.data.filter(function (notification) {
                            return notification.resourceEventId === event.id
                        })
                    })

                    return eventsResponse
                })
            })
        })
    };

    api.getEvent = function (eventId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/resource-audit-events/' + eventId).then(function (eventResponse) {
            var notificationRequestsUrl = wwtEnv.getApiForwardUrl() + '/notification-requests?pageSize=5&resourceEventIds=' + eventId

            return $http.get(notificationRequestsUrl).then(function (notificationRequestsResponse) {
                eventResponse.data.notificationRequests = notificationRequestsResponse.data

                var notificationsUrl = wwtEnv.getApiForwardUrl() + '/notifications?resourceEventIds=' + eventId
                return $http.get(notificationsUrl).then(function (notificationsResponse) {
                    eventResponse.data.notifications = notificationsResponse.data
                    return eventResponse
                })
            })
        })
    };

    api.createAllDefaultEventsForResourceType = function (resourceTypeId) {
        return notificationsAPI.getDefaultEventTypesForResourceType(resourceTypeId).then(function (response) {
            var unusedDefaultsRequest = [];

            _.forIn(response.data, function (value, key) {
                if (!value.isPresent) {
                    unusedDefaultsRequest.push(api.createDefaultEventForResourceType(resourceTypeId, value));
                }
            });

            return $q.all(unusedDefaultsRequest);
        });
    };

    api.createDefaultEventForResourceType = function (resourceTypeId, defaultType) {
        var newEventType = {
            id: defaultType.targetId,
            title: defaultType.title,
            description: defaultType.description,
            pathToResourceId: 'id',
            amqpExchange: defaultType.targetAmqpExchange,
            amqpRoutingKey: '#',
            resourceType: {id: resourceTypeId},
            templates: defaultType.templates,
            tokens: defaultType.tokens
        };

        return api.getEventTypeById(newEventType.id).then(function () {
            // it already exists so we need to restore it, then update it.
            return api.restoreEventType(newEventType.id).then(function () {
                return api.updateEventType(newEventType).then(function (response) {
                    return response
                });
            });
        }).catch(function (err) {
            // it doesn't exist so we're good
            return api.createEventType(newEventType).then(function (response) {
                return response
            });

        });
    };

    return api;
}
