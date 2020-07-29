appModule.factory('assetGroups', makeassetGroups);

function makeassetGroups($q, appsAPI, apisAPI, componentsAPI) {
    var assetGroups = {};

    assetGroups.groups = [
        {
            title: "Applications",
            slug: "applications",
            getter: appsAPI.getApps,
            mapItem: function (item) {
                return {
                    id: item.id,
                    title: item.appName,
                    icon: item.iconName,
                    description: item.appDescription,
                    groupSlug: 'applications',
                    keywords: item.keywords || []
                }
            }
        },
        {
            title: "API's",
            slug: "apis",
            getter: apisAPI.getApis,
            mapItem: function (item) {
                return {
                    id: item.id,
                    title: item.apiName,
                    description: item.description,
                    groupSlug: 'apis',
                    keywords: item.keywords || []
                }
            }
        },
        {
            title: "Components",
            slug: "components",
            getter: componentsAPI.getComponents,
            mapItem: function (item) {
                return {
                    id: item.id,
                    title: item.name,
                    name: item.name,
                    icon: item.iconName,
                    iconName: item.iconName,
                    shortDescription: item.shortDescription,
                    description: item.shortDescription,
                    groupSlug: 'components',
                    keywords: item.keywords || [],
                    connectedRepos: item.connectedRepos,
                    connectedVisionBoards: item.connectedVisionBoards,
                    connectedJenkinsJobs: item.connectedJenkinsJobs
                }
            }
        }
    ];

    assetGroups.getAndFormatData = function () {
        var requests = [];

        assetGroups.groups.forEach(function (group) {
            requests.push(group.getter());
        });

        return $q.all(requests).then(function (repsonses) {
            assetGroups.groups.forEach(function (group, index) {
                group.items = repsonses[index].data;
                group.formattedItems = [];


                group.items.forEach(function (item) {
                    group.formattedItems.push(group.mapItem(item));
                });
            });

            return assetGroups.groups;
        });

    };

    return assetGroups;
}
