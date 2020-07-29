appModule.factory('featureFlagsSVC', makefeatureFlagsSVC);

function makefeatureFlagsSVC() {
    var svc = {},
        STORAGE_KEY = 'dev-tool-belt-feature-flags';

    svc.flags = {
        // feature flags should look like this...
        // 'events': {
        //     title: 'Events',
        //     description: 'Note that you may need to refresh the page for the search to reflect changes.'
        // },
        'websockets': {
            title: 'Websockets',
            description: 'Enable the websockets admin section (in dot dot dot menu).'
        },
        'activityFeedWriteInDev': {
            title: 'Tinker with Activity Feed in dev',
            description: 'The activity feed is read only in dev and test to avoid confusion (emails aren\'t send in dev and test.'
        },
        'smsEventTemplates': {
            title: 'Try SMS templates for your event types.',
            description: 'SMS services are not yet live, but feel free to enable this tinker.'
        },
        'splunkApiReports': {
            title: 'View splunk api metrics directly on apis page.',
            description: 'View splunk api metrics directly on apis page.'
        },
        'versioning': {
            title: 'Versioning',
            description: 'Enable users to add multiple versions of an API to the API Routes.'
        }
    };

    svc.saveFlags = function () {
        return window.localStorage[STORAGE_KEY] = JSON.stringify(svc.flags);
    };

    svc.flagIsActive = function (flag) {
        var targetFlag = svc.flags[flag];

        return targetFlag ? targetFlag.value : false;
    };

    function init() {
        var savedFlags = window.localStorage[STORAGE_KEY];

        if (!savedFlags) {
            savedFlags = svc.saveFlags();
        }

        savedFlags = JSON.parse(savedFlags);

        _.forIn(savedFlags, function (value, key) {
            var targetFlag = svc.flags[key];

            if(!targetFlag) {
                // the feature flag is no longer a feature flag, so let's
                // remove it
                delete savedFlags[key];
                svc.saveFlags();
                return;
            }

            targetFlag.value = value.value;
        });
    }

    init();

    return svc;
}
