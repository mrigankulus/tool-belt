appModule.directive('newAssetBanner', newAssetBannerDirective);

function newAssetBannerDirective() {
    var template = '<div class="card-banner" ng-if="::isNewAsset(app)">New</div>';

    return {
        restrict: 'E',
        template: template,
        scope: {
            item: '='
        },
        link: link
    };

    function link($scope) {
        $scope.isNewAsset = function () {
            var item = $scope.item;

            if (!item) {
                return;
            }

            if (!item.creationDate && !item.who) {
                return;
            }

            var creationDate = item.creationDate || item.who.creationDate;

            // this is a little less clear than using moment(), but it's much
            // faster for this

            // 30 days ago
            var dateThreshold = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
            creationDate = new Date(creationDate).getTime();

            return creationDate > dateThreshold;
        }
    }
}