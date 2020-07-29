/*
 * We declare some properties in variables here so that they can be referenced throughout the rest of the configuration.
 */
var depDir = 'node_modules',
    sourceDir = 'src',
    outputDir = 'dist',
    cloudFoundryDir = 'cloudFoundry';

module.exports = {
    depDir: depDir,
    /*
     * The directory for web source files, especially JavaScript and CSS. The related tasks will primarily search
     * here for files.
     */
    sourceDir: sourceDir,
    /*
     * The directory in which the finished web application will be generated. JavaScript files will be concatenated
     * into here, LESS files will be compiled into CSS and placed here, asset files will be copied here, etc.
     */
    outputDir: outputDir,
    // Directory containing any cloudFoundry specific files
    cloudFoundryDir: cloudFoundryDir,
    /*
     * This is the path that will be used when the application runs locally, e.g. if basePageName = yourApp, then the
     * local URL will be http://localhost:3456/yourApp
     */
    basePageName: 'dev-tool-belt',
    /*
     * We'll use a single Angular module for the application. We may still pull in multiple modules from external
     * libraries, but our entire application will be one.
     */
    appModule: {
        /*
         * The name of the Angular application module. This should match the value of your `ng-app` directive in
         * your index.html.
         */
        name: 'dev-tool-belt',

        /*
         * Module dependencies. The Angular application module will depend on these modules.
         *
         * Remember that Angular modules are different than Angular components like controllers and services. For
         * instance, When using the Restangular library, the module is named `restangular` and should be included in
         * this list. The component is named `Restangular` (with a capital 'R') and should be injected into
         * other controllers, services, etc. that need to use Restangular.
         */
        includes: [
            'ngTouch',
            'ngAnimate',
            'restangular',
            'templates-main',
            'ui.router',
            'messenger',
            'hl.sticky',
            'googleAnalytics',
            'dynamic-title',
            'wwt-user',
            'angular-images-loaded',
            'wwt-attachments',
            'monospaced.elastic',
            'cfp.hotkeys',
            'wwt-env',
            'wwt-scroll-trap',
            'ngEmoticons',
            'ngFileUpload',
            'ngSanitize',
            'utf8-base64',
            'hc.marked',
            'ui.select',
            'highcharts-ng',
            'angular-cache',
            'jsonFormatter',
            'ngPrettyJson',
            'ui.bootstrap',
            'wwt-resource-watcher',
            'wwt-resource-event-stream',
            'ngclipboard',
            'mentio',
            'wwt-focus-panel',
            'wwt-ng-sockets',
            'wwt-tasks',
            'wwt-activity-feed',
            'angular-cron-jobs',
            'angular-inview'
        ]
    },

    /*
     * We recognize two types of JavaScript files: internal and external.
     *
     * Internal files are specific to this project and will be concatenated into 'dist/internal.js'. These files
     * will have access to the `appModule` variable representing the Angular application module.
     *
     * External files will be concatenated into `dist/third-party.js`. These should be third-party libraries like
     * Angular.
     *
     * `third-party.js` will be loaded before `internal.js`. Files will be concatenated into their destination in
     * the order in which they appear in the following arrays.
     *
     * Any JavaScript file ending in `Spec.js` will be excluded. This means that we can include tests right next
     * to the files under test without worrying about them ending up in our final distributable.
     */
    javaScriptFiles: {
        internal: [
            sourceDir + '/**/*.js'
        ],
        external: [
            depDir + '/bowser/bowser.js',
            depDir + '/dot-object/dist/dot-object.min.js',
            depDir + '/highcharts/highcharts.js',
            depDir + '/browser-detector/src/browserDetector.js',
            depDir + '/jquery/dist/jquery.js',
            depDir + '/angular/angular.js',
            depDir + '/vue/dist/vue.min.js',
            depDir + '/angular-touch/angular-touch.js',
            depDir + "/angular-animate/angular-animate.js",
            depDir + "/angular-sanitize/angular-sanitize.js",
            depDir + '/angular-ui-router/release/angular-ui-router.js',
            depDir + '/angular-inview/angular-inview.js',
            depDir + '/showdown/dist/showdown.js',
            depDir + '/marked/lib/marked.js',
            depDir + '/angular-marked/dist/angular-marked.js',
            depDir + '/angular-utf8-base64/angular-utf8-base64.js',
            depDir + '/lodash/index.js',
            depDir + '/restangular/dist/restangular.js',
            depDir + '/google-analytics/dist/google-analytics.js',
            depDir + '/messenger/dist/messenger.js',
            depDir + '/dynamic-title/dist/dynamic-title.js',
            depDir + '/wwt-attachments/dist/wwt-attachments.js',
            depDir + '/wwt-scroll-trap/dist/wwt-scroll-trap.js',
            depDir + '/wwt-env/dist/wwt-env.min.js',
            depDir + '/wwt-user/dist/wwt-user.js',
            depDir + '/imagesloaded/imagesloaded.pkgd.min.js',
            depDir + '/angular-images-loaded/angular-images-loaded.js',
            depDir + '/ng-file-upload/dist/ng-file-upload-all.min.js',
            depDir + '/URIjs/src/URI.js',
            depDir + '/angular-dragula/dist/angular-dragula.js',
            depDir + '/angular-elastic/elastic.js',
            depDir + '/angular-hotkeys/build/hotkeys.js',
            depDir + '/angular-sticky-plugin/dist/angular-sticky.js',
            depDir + '/ui-select/dist/select.js',
            depDir + '/moment/moment.js',
            depDir + '/moment-range/dist/moment-range.js',
            depDir + '/moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js',
            depDir + '/highcharts-ng/dist/highcharts-ng.js',
            depDir + '/angular-cache/dist/angular-cache.js',
            depDir + '/jsonformatter/dist/json-formatter.min.js',
            depDir + '/ng-prettyjson/dist/ng-prettyjson.min.js',
            depDir + '/angular-ui-bootstrap/dist/ui-bootstrap.js',
            depDir + '/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            depDir + '/ng-emoticons/dist/ng-emoticons.min.js',
            depDir + '/wwt-resource-watcher/dist/wwt-resource-watcher.js',
            depDir + '/wwt-resource-event-stream/dist/wwt-resource-event-stream.js',
            depDir + '/clipboard/dist/clipboard.min.js',
            depDir + '/ngclipboard/dist/ngclipboard.min.js',
            depDir + '/ment.io/dist/mentio.js',
            depDir + '/wwt-focus-panel/dist/wwt-focus-panel.js',
            depDir + '/wwt-ng-sockets/dist/wwt-ng-sockets.js',
            depDir + '/wwt-tasks/dist/wwt-tasks.js',
            depDir + '/angular-cron-jobs/dist/angular-cron-jobs.js',
            depDir + '/xlsx/dist/xlsx.core.min.js',
            depDir + '/vuebar/vuebar.js',
            depDir + '/@wwt/vue-sockets/dist/WwtSockets.umd.js',
            depDir + '/@wwt/vue-env-banner/dist/WwtEnvBanner.umd.js',
            depDir + '/iframe-resizer/js/iframeResizer.js',
            depDir + '/@wwt/vue-groups/dist/Group.umd.js'
        ]
    },
    /*
     * Angular partials will be collected using html2js into a single script file.
     * This means that they can be eagerly loaded in one server call, that they are available to tests
     * and that we can more easily cache-bust them.
     */
    html2js: {
        templateFiles: [sourceDir + '/**/*.html', '!' + sourceDir + '/index.html'],
        outputFile: outputDir + '/templates.js'
    },
    /*
     * We assume that we are compiling a single LESS file into a single 'app.css' file in the outputDir.
     * This root file should @include any other LESS or CSS files we may want.
     */
    rootLessFile: sourceDir + '/application/app.less',
    /*
     * Enables live reloading of browser when changes to HTML, JavaScript, and LESS files are made.
     */
    livereload: true,
    /*
     * Name of generated war file for deployment
     */
    warName: 'dev-tool-belt',
    /*
     * Directory to output war - Jenkins counts on this being /target so you need to have a good reason
     * to change this
     */
    warDir: 'target',
    archiveName: 'dev-tool-belt',
    archiveDir: 'target'

};
