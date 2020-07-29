appModule.factory('amqpExchangeUtil', makeamqpExchangeUtil);

function makeamqpExchangeUtil(resourcesAPI, messenger) {
    var amqpExchangeUtil = {};

    amqpExchangeUtil.formatExchangesForSelect = function (exchanges) {
        return _.map(exchanges, function(it) {
            return {
                title: it
            }
        });
    }

    amqpExchangeUtil.refreshAmqpResults = function ($select) {
        var search = $select.search,
            list = angular.copy($select.items);

        //remove last user input
        _.remove(list, 'userEntered');

        if (!search) {
            //use the predefined list
            $select.items = list;
        } else {
            //manually add user input and set selection
            var userInputItem = {
                userEntered: true,
                title: search
            };
            $select.items = [userInputItem].concat(list);
            $select.selected = userInputItem;
        }
    }

    amqpExchangeUtil.setExchangesInUsedBy = function (exchanges) {

        return resourcesAPI.getEventTypes().then(function (response) {
            if (!response.data) {
                return;
            }

            var eventTypes = response.data

            eventTypes.forEach(function (eventType) {
                var matchedExchange = _.find(exchanges, {'title': eventType.amqpExchange});
                if (matchedExchange) {
                    matchedExchange.isUsedBy = eventType;
                }
            });

            return exchanges;
        });
    };

    amqpExchangeUtil.exchangeForEventTypeIsInUse = function (eventType) {
        if (!eventType.resourceType.eventTypes || !eventType.amqpExchange) {
            return;
        }

        var firstMatchingEvent = _.find(eventType.resourceType.eventTypes, {amqpExchange: eventType.amqpExchange, deleted: false});

        if (firstMatchingEvent && firstMatchingEvent.id != eventType.id) {
            messenger.showMessage({
                "type": "error",
                "title": "That Exchange is Taken",
                "content": "The \"" + eventType.amqpExchange + "\" exchange is already used by " + firstMatchingEvent.id + ". Exchanges cannot be re-used for event types.",
                "isDismissable": true
            });

            return true;
        }
    }

    return amqpExchangeUtil;
}