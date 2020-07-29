// these are the collections that the searcher will search
appModule.factory('searcherCollections', makesearcherCollections);

function makesearcherCollections(appsAPI, apisAPI, componentsAPI, resourcesAPI, $state, $q, assetGroups, featureFlagsSVC, usersAPI, userPermissionsAPI, partnersAPI, cronJobsApi, technologiesApi) {
    var svc = {};

    svc.collections = [
        {
            title: 'Pages',
            slug: 'pages',
            dataGetter: pagesGetter,
            resultMapper: pageMapper,
            restrictToPermissionFunc: userPermissionsAPI.isDeveloper
        },
        {
            title: 'Applications',
            slug: 'applications',
            isPinnable: true,
            dataGetter: applicationsGetter,
            resultMapper: applicationMapper
        },
        {
            title: 'APIs',
            slug: 'apis',
            isPinnable: true,
            dataGetter: apisGetter,
            resultMapper: apiMapper,
            restrictToPermissionFunc: userPermissionsAPI.canEditApis
        },
        {
            title: 'Components',
            slug: 'components',
            isPinnable: true,
            dataGetter: componentsGetter,
            resultMapper: componentMapper,
            restrictToPermissionFunc: userPermissionsAPI.canEditComponents
        },
        {
            title: 'Technologies',
            slug: 'technologies',
            isPinnable: false,
            dataGetter: technologiesGetter,
            resultMapper: technologyMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewTechnologies
        },
        {
            title: 'Resource Types',
            slug: 'resourceTypes',
            dataGetter: resourcesGetter,
            resultMapper: resourceMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewResources
        },
        {
            title: 'Event Types',
            slug: 'eventTypes',
            dataGetter: eventsGetter,
            resultMapper: eventTypeMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewEvents
        },
        {
            title: 'Profiles',
            slug: 'profiles',
            dataGetter: profilesGetter,
            resultMapper: profileMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewProfiles
        },
        {
            title: 'Users',
            slug: 'users',
            dataGetter: usersGetter,
            resultMapper: userMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewUsers
        },
        {
            title: 'Partners',
            slug: 'partners',
            dataGetter: partnerGetter,
            resultMapper: partnerMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewPartners
        },
        {
            title: 'Cron Jobs',
            slug: 'cron-jobs',
            dataGetter: cronJobsGetter,
            resultMapper: cronJobsMapper,
            restrictToPermissionFunc: userPermissionsAPI.canViewCronJobs
        }
    ];

    svc.preLoadSomeGimmes = function () {
        // this can be called before the search to preload some
        // obvious choices. These are cached after they're retrieved.
        componentsAPI.getComponents()
        appsAPI.getApps()
        apisAPI.getApis()
    }

    function pagesGetter(searchTerm) {
        var deferred = $q.defer(),
            states = $state.get(),
            searchResults;

        searchResults = _.filter(states, function (state) {
            return (state.data) &&
                    (state.data.restrictToFeatureFlag ? featureFlagsSVC.flagIsActive(state.data.restrictToFeatureFlag) : true) &&
                    (state.data.browserTitle) &&
                    (state.data.browserTitle.toLowerCase().indexOf(searchTerm) > -1) &&
                    (state.data.isSearchable)
        });

        return removePagesWithoutPermission(searchResults).then(function (results) {
            deferred.resolve(results);

            return deferred.promise;
        });
    }

    function removePagesWithoutPermission(states) {
        var deferred = $q.defer(),
            results = [],
            statesThatRequireAuth = [];

        states.forEach(function (state) {
            if (!state.data || !state.data.restrictSearchToPermissionFuncName) {
                results.push(state);
            } else {
                if (userPermissionsAPI[state.data.restrictSearchToPermissionFuncName]) {
                    state.authRequest = userPermissionsAPI[state.data.restrictSearchToPermissionFuncName]();
                    statesThatRequireAuth.push(state);
                }
            }
        });

        if (statesThatRequireAuth && statesThatRequireAuth.length) {
            var authRequests = _.map(statesThatRequireAuth, function (it) {
                return it.authRequest;
            });

            $q.all(authRequests).then(function (responses) {
                responses.forEach(function (it, index) {
                    if (it) {
                        results.push(statesThatRequireAuth[index]);
                    }
                });

                deferred.resolve(results);
            });
        } else {
            deferred.resolve(results);
        }

        return deferred.promise;
    }

    function pageMapper(item) {
        return {
            title: item.data.browserTitle,
            targetState: item.name
        }
    }

    function applicationsGetter(searchTerm) {
        return appsAPI.getApps().then(function (response) {
            var apps = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();

            searchResults = _.filter(apps, function (app) {
                return (app.appName.toLowerCase().indexOf(searchTerm) > -1) ||
                    _.find(app.keywords, function (it) {
                        if (!it) {
                            return false;
                        }

                        return it.toLowerCase().indexOf(searchTerm) > -1
                    });
            });

            return searchResults;
        });
    }

    function applicationMapper(item) {
        var assetGroup = _.find(assetGroups.groups, {'slug': 'applications'});
        var mappedItem = assetGroup.mapItem(item);

        mappedItem.targetState = 'applicationDetail({id: \'' + mappedItem.id + '\'})';

        return mappedItem;
    }

    function apisGetter(searchTerm) {
        return apisAPI.getApis().then(function (response) {
            var apis = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();
            searchResults = _.filter(apis, function (api) {
                return (api.apiName.toLowerCase().indexOf(searchTerm) > -1) ||
                    _.find(api.keywords, function (it) {
                        if (!it) {
                            return false;
                        }

                        return it.toLowerCase().indexOf(searchTerm) > -1
                    });
            });

            return searchResults;
        });
    }

    function apiMapper(item) {
        var assetGroup = _.find(assetGroups.groups, {'slug': 'apis'});
        var mappedItem = assetGroup.mapItem(item);

        mappedItem.targetState = 'apiDetail({id: \'' + mappedItem.id + '\'})';

        return mappedItem;
    }

    function componentsGetter(searchTerm) {
        return componentsAPI.getComponents().then(function (response) {
            var components = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();

            searchResults = _.filter(components, function (component) {
                return (component.name.toLowerCase().indexOf(searchTerm) > -1) ||
                    _.find(component.keywords, function (it) {
                        if (!it) {
                            return false;
                        }

                        return it.toLowerCase().indexOf(searchTerm) > -1
                    });
            });

            return searchResults;
        });
    }

    function componentMapper(item) {
        var assetGroup = _.find(assetGroups.groups, {'slug': 'components'});
        var mappedItem = assetGroup.mapItem(item);

        mappedItem.targetState = 'componentDetail({id: \'' + mappedItem.id + '\'})';

        return mappedItem;
    }

    function technologiesGetter(searchTerm) {
        return technologiesApi.get().then(function (response) {
            var technologies = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();

            searchResults = _.filter(technologies, function (technology) {
                return (technology.name.toLowerCase().indexOf(searchTerm) > -1) ||
                    _.find(technology.keywords, function (it) {
                        if (!it) {
                            return false;
                        }

                        return it.toLowerCase().indexOf(searchTerm) > -1
                    });
            });

            return searchResults;
        });
    }

    function technologyMapper(item) {
        item.targetState = 'technologyDetail({id: \'' + item.id + '\'})';
        item.title = item.name
        item.icon = item.iconName
        item.groupSlug = 'technologies';
        return item;
    }

    function resourcesGetter(searchTerm) {
        return resourcesAPI.getResourceTypes().then(function (response) {
            var resourceTypes = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();

            searchResults = _.filter(resourceTypes, function (resourceType) {
                return (resourceType.title.toLowerCase().indexOf(searchTerm) > -1);
            });

            return searchResults;
        });
    }

    function resourceMapper(item) {
        item.targetState = 'resourceTypeDetail({id: \'' + item.id + '\'})';
        item.groupSlug = 'resourceTypes';
        return item;
    }

    function eventsGetter(searchTerm) {
        return resourcesAPI.getEventTypes().then(function (response) {
            var eventTypes = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();

            searchResults = _.filter(eventTypes, function (eventType) {
                return (eventType.title.toLowerCase().indexOf(searchTerm) > -1);
            });

            return searchResults;
        });
    }

    function eventTypeMapper(item) {
        item.targetState = 'eventTypeDetail({id: \'' + item.id + '\'})';
        item.groupSlug = 'eventTypes';
        return item;
    }

    function profilesGetter(searchTerm) {
        return appsAPI.getAllProfiles().then(function (response) {
            var profiles = response.data,
                searchResults;

            searchTerm = searchTerm.toLowerCase();

            searchResults = _.filter(profiles, function (profile) {
                return (profile.name.toLowerCase().indexOf(searchTerm) > -1);
            });

            return searchResults;
        });
    }

    function profileMapper(item) {
        var mappedItem = item;

        mappedItem.title = item.name;

        mappedItem.targetState = 'profileDetail({profileId: \'' + item.id + '\'})';

        return mappedItem;
    }

    function usersGetter(searchTerm) {
        return usersAPI.findUserBySearchTerm(searchTerm).then(function (response) {
            return response.data;
        });
    }

    function userMapper(item) {
        var mappedItem = item;

        mappedItem.title = (item.fullName || item.userName);
        mappedItem.userName = item.userName;
        mappedItem.enabled = item.enabled;
        mappedItem.targetState = 'userDetail({userName: \'' + (item.wwtUserId || item.userName) + '\'})';

        return mappedItem;
    }

    function partnerGetter(searchTerm) {
        return partnersAPI.searchPartners(searchTerm).then(function (response) {
            return response.data;
        })
    }

    function partnerMapper(item) {
        var mappedItem = item;

        mappedItem.title = item.objValue;

        mappedItem.targetState = 'partnerDetail({partnerId: \'' + item.objAltValue + '\'})';

        return mappedItem;
    }

    function cronJobsGetter(searchTerm) {
        return cronJobsApi.getJobs().then(function (response) {
            return _.filter(response.data, function (it) {
                return it.id.includes(searchTerm);
            });
        });
    }

    function cronJobsMapper(item) {
        var mappedItem = item;

        mappedItem.title = item.id;
        mappedItem.targetState = 'cronJobDetail({id: \'' + item.id + '\'})';

        return mappedItem;
    }
    return svc;
}
