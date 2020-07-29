wwtScriptLoader = {};

wwtScriptLoader.loadScripts = function () {
    var env = wwtScriptLoader.getEnv();

    var scripts = [
        'third-party.js?c=<% cacheBustKey %>',
        'https://cdn.apps' + env.cloudFoundry + '.wwt.com/packages/artifactory/wwt-activity-feed/4/dist/wwt-activity-feed.js',
        'https://cdn.apps' + env.cloudFoundry + '.wwt.com/packages/artifactory/@wwt:vue-app-toolbar/3/dist/WwtAppToolbar.umd.min.js',
        'templates.js?c=<% cacheBustKey %>',
        'internal.js?c=<% cacheBustKey %>'
    ];

    var stylesheets = [
        'https://cdn.apps' + env.cloudFoundry + '.wwt.com/static/wwt-icon-font/style.css',
        'https://cdn.apps' + env.cloudFoundry + '.wwt.com/packages/artifactory/wwt-activity-feed/4/dist/wwt-activity-feed.css',
        'app.css?c=<% cacheBustKey %>'
    ];

    stylesheets.forEach(function(src) {
        var head = document.head,
            link = document.createElement('link')

        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = src

        head.appendChild(link)
    });

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.body.appendChild(script);
    });
};

wwtScriptLoader.getEnv = function () {
    var env = {
        cloudFoundry: '',
        weblogic: ''
    };

    var domain = window.location.hostname;

    if (domain.indexOf('-dev') > -1 || domain.indexOf('localhost') > -1) {
        return {
            cloudFoundry: '-dev',
            weblogic: '-dev'
        };
    }

    if (domain.indexOf('-tst') > -1 || domain.indexOf('-test') > -1) {
        return {
            cloudFoundry: '-tst',
            weblogic: '-test'
        };
    }

    return env;
};

wwtScriptLoader.loadScripts();
