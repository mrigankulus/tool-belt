appModule.factory('userEvents', makeUserEvents);

function makeUserEvents(amqpEventsAPI) {
    var userEvents = {};

    function publishEvent(exchange, message) {
        return amqpEventsAPI.sendEvent(exchange, '#', message, 'addActor');
    }

    userEvents.newUserInviteSent = function (newUser) {
        var message = _.cloneDeep(newUser);

        message.targetUsers = {
            restrictToUserNames: [
                newUser.id
            ],
            subscriberUserNames: [
                newUser.id
            ]
        };

        return publishEvent('wwt.user.password-setup.requested', message);
    };

    userEvents.manualUserInviteSent = function (user) {
        var message = _.cloneDeep(user);

        message.targetUsers = {
            restrictToUserNames: [
                user.id
            ],
            subscriberUserNames: [
                user.id
            ]
        };

        return publishEvent('wwt.user.password-setup.requested', message);
    };

    userEvents.userAddedToPartner = function (user, partner) {
        var message = _.cloneDeep(user);

        message.partner = partner;
        message.relatedResources = [
            {
                id: partner.partnerGroupId,
                resourceType: {
                    id: 'partner-company'
                }
            }
        ]

        return publishEvent('wwt.user.userAddedToPartner', message);
    };

    userEvents.userRemovedFromPartner = function (user, partner) {
        var message = _.cloneDeep(user);

        message.partner = partner;
        message.relatedResources = [
            {
                id: partner.partnerGroupId,
                resourceType: {
                    id: 'partner-company'
                }
            }
        ]

        return publishEvent('wwt.user.userRemovedFromPartner', message);
    };

    return userEvents;
}
