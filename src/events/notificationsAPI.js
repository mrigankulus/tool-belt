appModule.factory('notificationsAPI', makeNotificationsAPI);

function makeNotificationsAPI($http, wwtEnv, CacheFactory, $q, wwtUser) {
    var notificationsAPI = {};
    var cacheKeyExchanges = 'exchangesCache';
    var cacheKeyTemplateFilters = 'templateFiltersCache';

    CacheFactory(cacheKeyExchanges, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    CacheFactory(cacheKeyTemplateFilters, {
        maxAge: 15 * 60 * 1000,
        cacheFlushInterval: 60 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    notificationsAPI.apiExchangesURL = wwtEnv.getApiForwardUrl() + '/amqp-exchanges';
    notificationsAPI.apiTemplateFiltersURL = wwtEnv.getApiForwardUrl() + '/template-filters';
    notificationsAPI.subscriptionsApiURL = wwtEnv.getApiForwardUrl() + '/subscribable-resource-types';

    notificationsAPI.getDefaultEventTypesForResourceType = function (resourceTypeId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/default-event-types/resource-type-summaries/' + resourceTypeId, {cache: true});
    };

    notificationsAPI.getDefaultEventTypes = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/default-event-types', {cache: true});
    };

    notificationsAPI.getExchanges = function () {
        return $http.get(notificationsAPI.apiExchangesURL, {cache: CacheFactory.get(cacheKeyExchanges)});
    };

    notificationsAPI.getTemplateFilters = function () {
        return $q.when(true);

        // todo: I dont' think we're using this yet
        // return $http.get(notificationsAPI.apiTemplateFiltersURL, {cache: CacheFactory.get(cacheKeyTemplateFilters)});
    };

    notificationsAPI.getNotificationErrorsForNotificationRequest = function (notificationRequestId) {
        return $http.get(wwtEnv.getApiForwardUrl() + '/notification-errors?notificationRequestId=' + notificationRequestId + '&pageSize=2000' + '&sort={"who.creationDate": "desc"}');
    };

    notificationsAPI.getSubscribersForResourceType = function (resourceTypeId, query) {
        if (!query) {
            query = {}
        }

        return $http.get(notificationsAPI.subscriptionsApiURL + '/' + resourceTypeId + '/subscribers', {
            params: query
        });
    };

    notificationsAPI.getSubscribersForEventType = function (eventType, query) {
        if (!query) {
            query = {}
        }

        return $http.get(notificationsAPI.subscriptionsApiURL + '/' + eventType.resourceType.id + '/event-types/' + eventType.id + '/subscribers', {
            params: query
        });
    };

    notificationsAPI.getSubscribersForResource = function (resourceTypeName, resourceId, eventTypeId) {
        var params = '?resourceType=' + resourceTypeName + '&eventTypes=' + eventTypeId + '&resourceId=' + resourceId;
        return $http.get(notificationsAPI.subscriptionsApiURL + params);
    };

    notificationsAPI.getEventTypeSubscribersForResource = function (resourceType, resourceId, eventTypeId, data) {
        if (!data) {
            data = {};
        }

        var tokenData = encodeURIComponent(JSON.stringify(data));
        return $http.get(notificationsAPI.subscriptionsApiURL + '/' + resourceType + '/event-types/' + eventTypeId + '/resources/' + resourceId + '/subscribers/?tokenData=' + tokenData);
    };

    notificationsAPI.subscribeUserToEventTypeResource = function (resourceType, resourceId, eventTypeId, userId) {
        var newSubscriber = {
            wwtUserId: userId
        };

        return $http.post(notificationsAPI.subscriptionsApiURL + '/' + resourceType + '/event-types/' + eventTypeId + '/resources/' + resourceId + '/subscribers', newSubscriber);
    };

    notificationsAPI.subscribeUserToEventType = function (eventType, userId) {
        var newSubscriber = { wwtUserId: userId };
        return $http.post(notificationsAPI.subscriptionsApiURL + '/' + eventType.resourceType.id + '/event-types/' + eventType.id + '/subscribers', newSubscriber);
    };

    notificationsAPI.subscribeUserToResourceType = function (resourceType, userId) {
        var newSubscriber = { wwtUserId: userId };
        return $http.post(notificationsAPI.subscriptionsApiURL + '/' + resourceType.id + '/subscribers', newSubscriber);
    };

    notificationsAPI.getDefaultTokens = function () {
        return $http.get(wwtEnv.getApiForwardUrl() + '/default-event-tokens', {cache: true});
    };

    notificationsAPI.resourceTypeSubscription = function (resourceTypeId, userName) {
        return $http.get(notificationsAPI.subscriptionsApiURL + '/' + resourceTypeId + '/subscriptions/' + userName);
    };

    notificationsAPI.deleteResourceTypeSubscription = function (resourceTypeId, userName) {
        return $http.delete(notificationsAPI.subscriptionsApiURL + '/' + resourceTypeId + '/subscriptions/' + userName);
    };

    notificationsAPI.getUserSettings = function () {
        return wwtUser.getCurrentUser().then(function (response) {
            return $http.get(wwtEnv.getApiForwardUrl() + '/notification-user-settings/' + response.data.id, {cache: true});
        })
    };

    notificationsAPI.getEventEmailAnalytics = function (eventTypeId, fromDate, toDate) {
        var url = wwtEnv.getApiForwardUrl() + '/notification-analytics'
        url += '?eventTypeId=' + eventTypeId
        url += '&fromDate=' + moment(fromDate).toISOString() + '&toDate=' + moment(toDate).toISOString()

        return $http.get(url)
    }

    return notificationsAPI;
}