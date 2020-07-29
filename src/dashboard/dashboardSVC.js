appModule.factory('dashboardSVC', makedashboardSVC);

function makedashboardSVC(wwtUser, dashboardsAPI, apisAPI, githubAPI) {
    var dashboardSVC = {};

    dashboardSVC.dashboard = {};

    dashboardSVC.defaultWidgets = [
        {
            type: "myApiRouteOverrides",
            title: "My API Route Overrides",
            dataGetter: apisAPI.getOverridesForUser
        }
    ];

    dashboardSVC.getOrCreateForUser = function () {
        return wwtUser.getCurrentUser().then(function (response) {
            var user = response.data;

            return dashboardsAPI.getDashboardByUserName(user.userName).then(function (response) {

                if (!response.data) {
                    var dashboard = {
                        id: user.userName,
                        name: user.fullName,
                        items: dashboardSVC.defaultWidgets
                    };

                    return dashboardsAPI.create(dashboard).then(function (response) {
                        dashboardSVC.dashboard = response.data;
                        return response.data;
                    });
                }

                return response.data;
            });
        });
    };

    dashboardSVC.hydrateTempData = function () {
        if (!dashboardSVC.dashboard.items) {
            return false;
        }

        dashboardSVC.dashboard.items.forEach(function (it) {
            var defaultWidgetDefinition = getDefaultWidgetDefinition(it.type);

            if (defaultWidgetDefinition && (!it.tempData || !it.tempData.length)) {
                it.isLoading = true;

                defaultWidgetDefinition.dataGetter().then(function (response) {
                    it.tempData = response.data;
                    it.isLoading = false;
                });
            }
        });
    };

    // other things should be able to use this to let the
    // dashboard know that it might need to update something
    dashboardSVC.onUpdateItem = function (asset) {
        var dashboardItem = dashboardSVC.isInDashboard(asset);
        var dashboard = dashboardSVC.dashboard;


        if (!dashboardItem) {
            return;
        }

        if (dashboard && dashboard.items && dashboard.items.length) {
            _.merge(dashboardItem.data, asset);
            dashboardsAPI.clearCache();
        }

    };

    // other things should be able to use this to let the
    // dashboard know that it might need to remove something
    dashboardSVC.onDeleteItem = function (asset) {
        var dashboardItem = dashboardSVC.isInDashboard(asset);
        var dashboard = dashboardSVC.dashboard;

        if (!dashboardItem) {
            return;
        }

        if (dashboard && dashboard.items && dashboard.items.length) {
            _.remove(dashboard.items, dashboardItem);
            dashboardsAPI.update(dashboard);
        }

    };

    function getDefaultWidgetDefinition(widgetType) {
        return _.find(dashboardSVC.defaultWidgets, {'type': widgetType});
    }

    function cleanDirtyFields(item) {
        var cleanItem = _.clone(item);

        if (cleanItem.data) {
            delete cleanItem.data.packageJson;
            delete cleanItem.data.who;
        }

        // tempData isn't saved as it will be retrieved every time the dashboard loads.
        delete cleanItem.tempData;

        return cleanItem;
    }

    dashboardSVC.toggleItemIsPinned = function (item) {
        var dashboard = dashboardSVC.dashboard;

        item = cleanDirtyFields(item);

        if (dashboardSVC.isInDashboard(item)) {
            _.remove(dashboard.items, {'id': item.id});
        } else {
            dashboard.items.push(item);
        }

        return dashboardsAPI.update(dashboard);
    };

    dashboardSVC.isInDashboard = function (item) {
        return _.find(dashboardSVC.dashboard.items, function(it) {
            // soft comparison (==) is intentional here. some ids are
            // numbers and some are strings. some should actually be
            // strings so we can't parseInt(). We could probably convert
            // everything to strings here, but that could have other
            // implications so let's come back to it.
            return it.id == item.id;
        });
    };

    dashboardSVC.update = function () {
        dashboardsAPI.update(dashboardSVC.dashboard).then(function () {
            // updates will clear cache, so let's go ahead and re-cache.
            dashboardSVC.getOrCreateForUser();
        });
    };

    function init() {
        dashboardSVC.dashboard.isReady = false;

        dashboardSVC.getOrCreateForUser().then(function (response) {
            dashboardSVC.dashboard = response;
            dashboardSVC.dashboard.isReady = true;
        });
    }

    init();

    return dashboardSVC;
}