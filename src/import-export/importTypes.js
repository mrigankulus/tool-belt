appModule.factory('importTypes', makeimportTypes);

function makeimportTypes(resourcesAPI, componentsAPI, $q, appsAPI, technologiesApi) {
    var importTypes = {};

    importTypes.types = {
        resourceType: {
            checkFunc: resourcesAPI.getResourceType,
            createFunc: resourcesAPI.createResourceType,
            updateFunc: resourcesAPI.updateResourceType,
            restoreFunc: resourcesAPI.restoreResourceType,
            beforeAddToExportFunc: function (formatted) {
                // Resource type is null on the event type so we need to
                // be sure to set it.
                return appsAPI.getApps().then(function (response) {
                    formatted.eventTypes.forEach(function (it) {
                        it.isSelected = true;
                        it.resourceType = {
                            id: formatted.id
                        };

                        // have to do a few special things since app ids are different
                        // in different environments
                        if (it.relatedAppId) {
                            var matchingApp = _.find(response.data, {id: parseInt(it.relatedAppId)});
                            it.relatedApp = matchingApp;
                        }
                    });

                    return formatted;
                });
            },
            beforeSaveFunc: function (item) {
                return $q.when(item);
            },
            subTypes : {
                // this item must match the property from the export list!
                eventTypes: {
                    checkFunc: resourcesAPI.getEventType,
                    createFunc: function (eventType) {
                        return processAppForTrueId(eventType).then(function (processedEventType) {
                            return resourcesAPI.createEventType(processedEventType);
                        });
                    },
                    updateFunc: function (eventType) {
                        return processAppForTrueId(eventType).then(function (processedEventType) {
                            return resourcesAPI.updateEventType(processedEventType);
                        });
                    },
                    restoreFunc: function (eventType) {
                        return processAppForTrueId(eventType).then(function (processedEventType) {
                            return resourcesAPI.restoreEventType(processedEventType);
                        });
                    },
                    beforeSaveFunc: function (item) {
                        return $q.when(item);
                    }
                }
            }
        },
        component: {
            checkFunc: componentsAPI.getComponentById,
            createFunc: componentsAPI.create,
            updateFunc: componentsAPI.update,
            beforeAddToExportFunc: function (formatted) {
                // have to get this sucker again...it simplifies things.
                return componentsAPI.getComponentById(formatted.id).then(function (response) {
                    var technologies = _.get(response.data, 'technologies')

                    if (_.size(technologies)) {
                        formatted.technologies = _.map(technologies, function (it) {
                            return {
                                id: it.id
                            }
                        })
                    }

                    return $q.when(formatted);
                })

            },
            beforeSaveFunc: function (item) {
                var cleanItem = _.clone(item, true);

                delete cleanItem.title;
                delete cleanItem.icon;
                delete cleanItem.description;
                delete cleanItem.groupSlug;
                delete cleanItem.targetState;
                delete cleanItem.importType;
                delete cleanItem.importActionText;
                delete cleanItem.isImporting;
                delete cleanItem.succssfulSubItemImportCount;

                return $q.when(cleanItem);
            }
        },
        technology: {
            checkFunc: technologiesApi.getById,
            createFunc: technologiesApi.create,
            updateFunc: technologiesApi.update,
            beforeAddToExportFunc: function (formatted) {
                return $q.when(formatted);
            },
            beforeSaveFunc: function (item) {
                return $q.when(item);
            }
        }
    };

    function processAppForTrueId(eventType) {
        // the app id will be different in different environments. this will
        // look for the app, and update the id if it exists in this environment.
        if (!eventType.relatedAppId || !eventType.relatedApp) {
            return $q.when(eventType);
        }

        return appsAPI.getApps().then(function (response) {
            var matchingApp = _.find(response.data, {appName: eventType.relatedApp.appName});

            if (!matchingApp) {
                eventType.relatedAppId = null;
                eventType.importErrors = ['Related app "' + eventType.relatedApp.appName + '" could not be added to this event type.'];

                return eventType;
            }

            eventType.relatedAppId = matchingApp.id;

            return eventType;
        });
    }

    return importTypes;
}