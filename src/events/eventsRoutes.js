appModule.constant('eventsRoutes', function () {
    return [
        { slug: 'compose', displayName: 'Compose' },
        { slug: 'subscriptions', displayName: 'Subscriptions' },
        { slug: 'activity', displayName: 'Activity' },
        { slug: 'playground', displayName: 'Playground' },
        { slug: 'analytics', displayName: 'Analytics' },
        { slug: 'settings', displayName: 'Settings' }
    ];
});

appModule.config(function ($stateProvider, eventsRoutes) {

    $stateProvider.state('eventTypes', {
        url: '/event-types',
        templateUrl: 'events/eventTypes.html',
        controller: 'EventTypesCtrl',
        controllerAs: 'EventTypes',
        data: {
            pageName: 'event-types',
            browserTitle: 'Event Types',
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewEvents'
            // an example of how to restrict a page to a feature flag
            // restrictToFeatureFlag: 'events'
        }
    });

    $stateProvider.state('eventTypes.howTo', {
        url: '/how-to',
        templateUrl: 'events/eventsHowTo.html',
        controller: 'EventsHowToCtrl',
        controllerAs: 'EventsHowTo',
        data: {
            pageName: 'events-help',
            browserTitle: 'Help | Event Types',
            isSearchable: false
        }
    });

    $stateProvider.state('eventTypes.howTo.general', {
        url: '/general',
        templateUrl: 'events/how-to/howToGeneral.html',
        data: {
            pageName: 'events-help',
            browserTitle: 'General | Help | Event Types',
            isSearchable: true,
            restrictSearchToPermissionFuncName: 'canViewEvents'
        }
    });

    $stateProvider.state('eventTypes.howTo.ui', {
        url: '/ui',
        templateUrl: 'events/how-to/howToUI.html',
        controller: 'EventsHowToCtrl',
        controllerAs: 'EventsHowTo',
        data: {
            pageName: 'events-help',
            browserTitle: 'Help | Event Types',
            isSearchable: false
        }
    });

    $stateProvider.state('eventTypes.howTo.grails', {
        url: '/grails',
        templateUrl: 'events/how-to/howToGrails.html',
        controller: 'EventsHowToCtrl',
        controllerAs: 'EventsHowTo',
        data: {
            pageName: 'events-help',
            browserTitle: 'Help | Event Types',
            isSearchable: false
        }
    });

    $stateProvider.state('eventTypes.howTo.node', {
        url: '/node',
        templateUrl: 'events/how-to/howToNode.html',
        controller: 'EventsHowToCtrl',
        controllerAs: 'EventsHowTo',
        data: {
            pageName: 'events-help',
            browserTitle: 'Help | Event Types',
            isSearchable: false
        }
    });

    $stateProvider.state('eventTypeDetail', {
        url: '/event-types/:id',
        templateUrl: 'events/eventTypeDetail.html',
        controller: 'EventTypeDetailCtrl',
        controllerAs: 'EventTypeDetail',
        data: {
            pageName: 'event-types-detail',
            browserTitle: 'Event Type'
        }
    });

    $stateProvider.state('eventTypeDetail.activity.activityList', {
        url: '/list',
        templateUrl: 'events/child-views/activity/eventList.html',
        controller: 'EventListCtrl',
        controllerAs: 'EventList',
        data: {
            pageName: 'event-list',
            browserTitle: 'Events'
        }
    });

    $stateProvider.state('eventTypeDetail.activity.eventDetail', {
        url: '/:eventId',
        templateUrl: 'events/child-views/activity/eventDetail.html',
        controller: 'EventDetailCtrl',
        controllerAs: 'EventDetail',
        data: {
            pageName: 'event-detail',
            browserTitle: 'Event'
        }
    });

    eventsRoutes().forEach(function (it) {

        if (it.manualRoute) {
            // will create this route manually
            return false;
        }

        $stateProvider.state('eventTypeDetail.' + it.slug, {
            url: '/' + it.slug,
            templateUrl: 'events/child-views/eventType' + it.displayName + '.html',
            controller: 'EventType' + it.displayName + 'Ctrl',
            controllerAs: 'EventType' + it.displayName,
            data: {
                pageName: 'events-' + it.slug,
                browserTitle: it.displayName
            }
        });

    });

});
