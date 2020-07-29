// Declare app level module which depends on filters, and services

// Define module fallbacks if not available (if the cdn is down).
var cdnComponentFallbacks = [
    'wwt-activity-feed'
]

cdnComponentFallbacks.forEach(function (it) {
    try {
        angular.module(it);
    } catch (error) {
        angular.module(it, []);
    }
})
// Configure routing
appModule.config(function ($urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
});

appModule.config(function ($stateProvider) {
    $stateProvider.state('dashboard', {
        url: '/',
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        controllerAs: 'Dashboard',
        data: {
            pageName: 'DashboardCtrl',
            browserTitle: 'Dashboard',
            isSearchable: true
        }
    });

    $stateProvider.state('dashboard.about', {
        url: 'about',
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        controllerAs: 'Dashboard',
        data: {
            pageName: 'DashboardCtrl',
            browserTitle: 'About'
        }
    });

    $stateProvider.state('404', {
        url: '/404',
        templateUrl: 'error/404.html',
        data: {
            pageName: '404',
            browserTitle: '404'
        }
    });
});

appModule.config(['markedProvider', function (markedProvider) {
    var hljs = window.hljs || false;
    var ignoreLangs = ['yml', 'groovy', 'shell', 'less'];

    if (hljs) {
        markedProvider.setOptions({
            gfm: true,
            tables: true,
            highlight: function (code, lang) {
                if (lang && ignoreLangs.indexOf(lang) === -1) {
                    return hljs.highlight(lang, code, true).value;
                } else {
                    return hljs.highlightAuto(code).value;
                }
            }
        });
    } else {
        markedProvider.setOptions({
            gfm: true,
            tables: true
        });
    }

}]);

// Configure HTTP interceptors
appModule.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpErrorHandler');

    // Support CORS
    $httpProvider.defaults.withCredentials = true;
}]);

appModule.config(function (uiSelectConfig) {
    uiSelectConfig.theme = 'select2';
    uiSelectConfig.resetSearchInput = true;
});

appModule.run(function (googleAnalytics, analyticsDriver) {
    analyticsDriver.start({locationPrefix: '/dev-tool-belt'});
    // googleAnalytics.debug();
});

appModule.run(function (wwtNgSocketsSettings) {
    // handy for testing the sockets api locally
    // wwtNgSocketsSettings.settings.apiUrl = 'http://localhost:6013/web-sockets';
    // wwtNgSocketsSettings.settings.socketUrl = 'ws://localhost:6013/web-sockets';
    // wwtNgSocketsSettings.settings.preferredProtocol = 'ws';
    // wwtNgSocketsSettings.settings.enableLogging = true;
});

appModule.run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        var oldRootStateName = fromState && fromState.name ? fromState.name.split('.')[0] : '';

        if (!oldRootStateName || !$state.includes(oldRootStateName)) {
            document.body.scrollTop = 0;
        }
    });
});

// Configure ng-animate to prevent it from trying to animate everything
appModule.config(['$animateProvider', function ($animateProvider) {
    // restrict animation to elements with the allow-ng-animate css class.
    $animateProvider.classNameFilter(/allow-ng-animate/);
}]);

appModule.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);


// ==========================================
// Register Vue Components
// ==========================================

// Vuebar directive adds a virtual scroller with some extra capabilities.
// it's used in the WwtNotifications component of the app toolbar.
if (Vuebar) {
    Vue.use(Vuebar)
}

// WwtSockets plugin - notifications needs this.
if (WwtSockets) {
    if (WwtSockets.default) {
        Vue.use(WwtSockets.default)
    } else {
        Vue.use(WwtSockets)
    }
}

// register the app toolbar.
// The dummyAppToolbar is a fallback in case the CDN is down.
// It renders an empty div.
let dummyAppToolbar = {
    name: 'WwtAppToolbar',
    data: function() {
        return {}
    },
    render: h => h('div')
}

let WwtAppToolbarComponent = window.WwtAppToolbar || dummyAppToolbar
Vue.component(WwtAppToolbarComponent.name, WwtAppToolbarComponent)
