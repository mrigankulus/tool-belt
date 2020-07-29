appModule.factory('assetState', makeAssetState);

function makeAssetState() {
    var assetState = {};

    assetState.currentAsset = {};

    assetState.setCurrentAsset = function (asset) {
        if (!asset.keywords) {
            asset.keywords = [];
        }

        return assetState.currentAsset = asset;
    };

    assetState.oAddRepo = function (repo) {
        assetState.currentAsset.connectedRepos.push({
            org: repo.owner.login,
            repo: repo.name
        });

        assetState.currentAsset.update();
    };

    assetState.onRemoveRepo = function (repo) {
        assetState.currentAsset.connectedRepos.push(repo);
        assetState.currentAsset.update();
    };

    assetState.shouldShowRepoConnectForm = function () {
        return !assetState.currentAsset.isLoading &&
                (!assetState.currentAsset.connectedRepos ||
                 !assetState.currentAsset.connectedRepos.length);
    };

    return assetState;
}
