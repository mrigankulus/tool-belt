appModule.factory('partnerProfileUserMapper', partnerProfileUserMapperFactory);

function partnerProfileUserMapperFactory($q, appsAPI) {
    var svc = {};

    svc.mapAllProfilesAndUsers = function (profiles, users) {
        var profileUserRequests = [];

        profiles.forEach(function (it) {
            it._users = [];
            profileUserRequests.push(hydrateUsersOnProfile(it))
        });

        return $q.all(profileUserRequests).then(function () {
            mapProfilesToUsers(profiles, users);
            return profiles;
        });
    };

    function mapProfilesToUsers(profiles, users) {
        users.forEach(function (user) {
            getRelatedProfilesForUser(profiles, user);
        })
    }

    function hydrateUsersOnProfile(profile) {
        return appsAPI.getUsersForProfile(profile.id).then(function (response) {
            profile._users = response.data;
            return profile
        });
    }

    function getRelatedProfilesForUser(profiles, user) {
        if (!profiles || !profiles.length) {
            return []
        }

        // need to clear the _profiles on the user first
        // to prevent the user from getting dupes
        user._profiles = [];

        profiles.forEach(function (profile) {
            if (_.find(profile._users, {ldapUserId: user.userName})) {
                user._profiles.push(profile)
            }
        });

        return user._profiles
    }

    return svc;
}