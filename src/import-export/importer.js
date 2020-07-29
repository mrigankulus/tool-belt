appModule.factory('importer', importerFactory);

function importerFactory($q, resourcesAPI, $timeout, importTypes) {
    var importer = {};

    importer.state = {
        itemCount: 0,
        importedCount: 0,
        isProcessingJson: false,
        isImporting: false
    };

    // list of raw items before they've been prepared for export
    importer.exportListPreprocessed = [];

    // list of items that are ready for export (what the user
    // copies to paste into import)
    importer.exportListProcessed = [];

    importer.addItemToExportList = function (item) {
        var formatted = item.formatted;

        if (!formatted.importType) {
            formatted.importType = formatted.groupSlug.slice(0, -1);

            // don't judge me
            if (formatted.importType === 'technologie') {
                formatted.importType = 'technology'
            }
        }

        var targetImportType = importTypes.types[formatted.importType];

        // todo: need to set a default beforeAddToExportFunc for import types
        return targetImportType.beforeAddToExportFunc(formatted).then(function (processed) {
            importer.exportListPreprocessed.push(processed);
            importer.exportListProcessed.push(_.clone(processed, true));
        });
    };

    // todo: this is specific to event types. could consider a "sub type onToggle" function instead
    importer.onEventTypeCheck = function (eventType, resourceType) {
        // grabbing "the opposite" of the current state for this. once this is clicked, it's
        // flipped. We want to know what it was before it was flipped.
        var isSelected = !eventType.isSelected;

        if (isSelected) {
            importer.exportListProcessed.forEach(function (it) {
                _.remove(it.eventTypes, function (et) {
                    return et.id === eventType.id;
                });
            });
        } else {
            var resourceType = _.find(importer.exportListProcessed, function (it) {
                return it.id === resourceType.id;
            });

            resourceType.eventTypes.push(_.clone(eventType, true));
        }
    };

    importer.checkImportList = function () {
        var countToCheck = importer.exportListProcessed.length,
            countChecked = 0;

        importer.exportListProcessed.forEach(function (it) {
            var targetImportType = importTypes.types[it.importType];

            forEachSubType(targetImportType, function (subTypeKey) {
                countToCheck += it[subTypeKey].length;
            });
        });

        importer.exportListProcessed.forEach(function (item) {
            importer.state.isProcessingJson = true;

            var targetImportType = importTypes.types[item.importType];

            checkItem(targetImportType, item).then(function () {
                countChecked++;

                if (countChecked > 0 && countChecked === countToCheck) {
                    markCheckComplete();
                    return;
                }

                forEachSubType(targetImportType, function (subTypeKey) {
                    var targetSubType = importTypes.types[item.importType].subTypes[subTypeKey];

                    item[subTypeKey].forEach(function (subItem) {
                        checkItem(targetSubType, subItem).then(function () {
                            countChecked++;

                            if (countChecked > 0 && countChecked === countToCheck) {
                                markCheckComplete();
                                return;
                            }
                        });
                    });
                });

            });
        });
    };

    function forEachSubType(importType, callback) {
        if (importType.subTypes) {
            _.forIn(importType.subTypes, function (child, childKey) {
                callback(childKey);

                // todo: figure out how to get this sucker to
                // recursively call itself
                // forEachSubType(importType.subTypes[childKey]);
            });
        }
    }

    function markCheckComplete() {
        $timeout(function () {
            importer.state.isProcessingJson = false;
        }, 1000);
    }

    importer.import = function () {
        if (importer.state.isImporting) {
            return;
        }

        importer.state.isImporting = true;
        setItemCount();

        importer.exportListProcessed.forEach(function (it) {
            importItem(it);
        });
    };

    importer.getImportProgress = function () {
        return ((importer.state.importedCount / importer.state.itemCount) * 100).toFixed();
    };

    function checkItem(importType, item) {
        return importType.checkFunc(item.id).then(function (getResponse) {
            if (getResponse.data.deleted) {
                item.importActionText = 'Will Restore';
                return item;
            } else {
                item.importActionText = 'Will Update';
                return item;
            }
        }).catch(function (err) {
            item.importActionText = 'Will Create';
            return item;
        });
    }

    function importItem(item, targetImportType, parentItem) {
        if (!item.succssfulSubItemImportCount) {
            item.succssfulSubItemImportCount = 0;
        }

        if (!targetImportType) {
            targetImportType = importTypes.types[item.importType];
        }

        return createOrUpdateItem(item, targetImportType).then(function (itemResponse) {

            item.importActionText = 'Done!';

            importer.state.importedCount++;

            // todo: need to figure out how to check for sub items and
            // ditch the hardcoded "eventTypes" here.
            if (!targetImportType.subTypes || !item['eventTypes'].length) {
                item.isImporting = false;
                item.importWasSuccessful = true;

                if (parentItem) {
                    parentItem.isImporting = false;
                    parentItem.importWasSuccessful = true;
                }

                markAsDoneImporting();
            }

            forEachSubType(targetImportType, function (subTypeKey) {
                var targetSubType = importTypes.types[item.importType].subTypes[subTypeKey];

                item[subTypeKey].forEach(function (subItem) {
                    return importItem(subItem, targetSubType, item).then(function () {
                        importer.state.importedCount++

                        if (parentItem) {
                            parentItem.succssfulSubItemImportCount++

                            if (parentItem.succssfulSubItemImportCount === item[subTypeKey].length) {
                                parentItem.isImporting = false;
                                parentItem.importWasSuccessful = true;
                            }
                        }

                        if (importer.state.importedCount === importer.state.itemCount) {
                            markAsDoneImporting();
                        }
                    });
                });
            });
        });


    }

    function markAsDoneImporting() {
        $timeout(function () {
            importer.state.isImporting = false;
        }, 1000);
    }

    function createOrUpdateItem(item, targetImportType) {
        return targetImportType.beforeSaveFunc(item).then(function (item) {
            return targetImportType.checkFunc(item.id).then(function (getResponse) {
                if (getResponse.data.deleted) {
                    return targetImportType.restoreFunc(item.id);
                } else {
                    return targetImportType.updateFunc(item);
                }
            }).catch(function (err) {
                return targetImportType.createFunc(item);
            });
        });
    }

    function setItemCount() {

        importer.exportListProcessed.forEach(function (item) {
            var targetImportType = importTypes.types[item.importType];

            importer.state.itemCount++;
            item.isImporting = true

            forEachSubType(targetImportType, function (subTypeKey) {
                var targetSubType = importTypes.types[item.importType].subTypes[subTypeKey];

                item[subTypeKey].forEach(function (subItem) {
                    importer.state.itemCount++
                    item.isImporting = true;
                });
            });
        });
    }

    return importer;
}