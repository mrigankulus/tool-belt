// this is the api for sending events, not the resource events api.
// https://github.wwt.com/custom-apps/events-api

appModule.factory('amqpEventsAPI', makeamqpEventsAPI);

function makeamqpEventsAPI($http, wwtEnv, wwtUser, assetState) {
    var api = {};

    api.apiUrl = wwtEnv.getApiForwardUrl() + '/events';

    api.sendEvent = function (exchange, routingKey, message, addActor) {
        if (!routingKey) {
            routingKey = '#';
        }

        routingKey = encodeURIComponent(routingKey);

        // todo: it would be cool if we could set the resource title from
        // something like this.
        // if (!message.resourceTitle && assetState.currentAsset) {
        //     message.resourceTitle = assetState.currentAsset.appName ||
        //                             assetState.currentAsset.apiName ||
        //                             assetState.currentAsset.name

        // }

        return wwtUser.getCurrentUser().then(function (userResponse) {
            message.actorUserName = userResponse.data.userName;
            // we need both user formats as we've changed to this one,
            // but activity streams will break if we update the event types
            // to use this new format. once the in app template is saved, that will
            // fix this problem. https://github.wwt.com/custom-apps/resources-api/issues/160
            message.actorUser = userResponse.data;

            return $http.post(api.apiUrl + '/' + exchange + '/' + routingKey, message);
        });

        return $http.post(api.apiUrl + '/' + exchange + '/' + routingKey, message);
    };

    return api;
}