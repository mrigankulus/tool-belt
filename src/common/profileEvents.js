appModule.factory('profileEvents', makeprofileEvents);

function makeprofileEvents($state, $q, wwtEnv, amqpEventsAPI, assetState) {
    var profileEvents = {};

    function publishEvent(exchange, message) {
        return amqpEventsAPI.sendEvent(exchange, '#', message, 'addActor');
    }

    profileEvents.linkUserToProfile = function (profile, targetUser) {
        var profileMessage = profile;
        profileMessage.targetUserName = (targetUser.ldapUserId || targetUser.userName);
        var requests = [publishEvent('wwt.userSecurityProfile.profileAddedToUser', profileMessage)];

        return $q.all(requests);

    };

    profileEvents.removeUserFromProfile = function (profile, targetUser) {
        var profileMessage = profile;
        profileMessage.targetUserName = (targetUser.ldapUserId || targetUser.userName);
        var requests = [publishEvent('wwt.userSecurityProfile.profileRemovedFromUser', profileMessage)];

        return $q.all(requests);
    };

    profileEvents.partnerAddedToProfile = function (partner, profile) {
        var message = _.cloneDeep(profile);
        message.partner = partner;

        return publishEvent('wwt.userSecurityProfile.partnerAddedToProfile', message);
    };

    profileEvents.profileAddedToPartner = function (partner, profile) {
        var message = _.cloneDeep(partner);
        message.id = message.partnerGroupId;
        message.profile = profile;

        return publishEvent('wwt.customer.profileAddedToPartner', message);
    };

    profileEvents.partnerRemovedFromProfile = function (partner, profile) {
        var message = _.cloneDeep(profile);
        message.partner = partner;

        return publishEvent('wwt.userSecurityProfile.partnerRemovedFromProfile', message);
    };

    profileEvents.profileRemovedFromPartner = function (partner, profile) {
        var message = _.cloneDeep(partner);
        message.id = message.partnerGroupId;
        message.profile = profile;

        return publishEvent('wwt.customer.profileRemovedFromPartner', message);
    };

    function isAppOrApi() {
        return $state.includes('apiDetail') ? 'api' : 'application';
    }

    return profileEvents;
}
