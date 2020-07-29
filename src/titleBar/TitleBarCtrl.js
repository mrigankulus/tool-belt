appModule.controller('TitleBarCtrl', function ($rootScope, wwtUser, wwtEnv, $state, $location, $scope) {
    var vm = this;

    vm.vueComponent = {};

    const environments = [
        { id: 'local', url: 'http://localhost:8000' },
        { id: 'dev', url: 'https://dev-tool-belt.apps-dev.wwt.com' },
        { id: 'tst', url: 'https://dev-tool-belt.apps-tst.wwt.com' },
        { id: 'prd', url: 'https://dev-tool-belt.apps.wwt.com' }
    ];

    init();
    function init() {
        const currentEnv = environments.find(it => it.id === wwtEnv.getEnv());

        $rootScope.canViewApp = ''

        // this is used to add a CSS class to the body for environment specific styles
        $rootScope.currentEnvironmentId = _.get(currentEnv, 'id') || 'dev';

        wwtUser.getCurrentUser().then(function (response) {
            // Internal users can view the app. Permissions are more fine grained
            // from there.
            $rootScope.canViewApp = _.get(response.data, 'internal')

            vm.vueComponent = new Vue({
                el: "#wwt-app-toolbar",
                data: {
                    user: response.data
                },
                components: {
                    WwtEnvBanner
                },
                methods: {
                    changeEnvironment(envId) {
                        const env = environments.find(it => it.id === envId)

                        if (env === undefined) {
                            return
                        }

                        // we can't link directly to apps and/or apis as those IDs are
                        // auto created numbers (not the same between environments).
                        if ($state.includes('applicationDetail')) {
                            window.location = env.url + '/apps';
                        } else if ($state.includes('apiDetail') || $state.includes('apis.platforms.platformDetail')) {
                            window.location = env.url + '/apis';
                        } else {
                            window.location = env.url + $location.$$url;
                        }
                    }
                }
            })
        });
    }

    // make sure our Vue component is destroyed when the controller is destroyed
    $scope.$on('$destroy', function onDestroy() {
        vm.vueComponent.$destroy(true)
    })
});
