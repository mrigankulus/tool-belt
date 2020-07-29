appModule.factory('rootApiUrl', rootApiUrlFactory);

function rootApiUrlFactory(wwtEnv) {
    // Having trouble getting api router setup so let's go back
    // to this for local dev until we can get it worked out.

    // use this to hit the api in dev
    return wwtEnv.getApiForwardUrl() + '/dev-assets';

    // hit the api locally
    //return 'http://localhost:8158';
}
