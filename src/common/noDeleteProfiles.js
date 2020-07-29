appModule.factory('noDeleteProfiles', makeNoDeleteProfilesList)

function makeNoDeleteProfilesList() {
    function getNoDeleteProfilesList(profile) {
        // this includes a list of core profiles that we do not want to get deleted
        return profile.name.toLowerCase() === 'it admin' ||
               profile.name.toLowerCase() === 'profile admin';
    }

    return {
        getNoDeleteProfilesList
    }
}
