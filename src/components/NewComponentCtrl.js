appModule.controller('NewComponentCtrl', makeNewComponentCtrl);

function makeNewComponentCtrl($state, componentsAPI, userPermissionsAPI, githubAPI) {

    var vm = this;

    vm.onRepoConnected = onRepoConnected;
    vm.create = create;

    vm.new = {};

    checkPermissions();

    function checkPermissions() {
        vm.permissionsHaveLoaded = false;

         userPermissionsAPI.canEditComponents().then(function (response) {
            vm.canEditComponents = response;
            vm.permissionsHaveLoaded = true;
        });
    }

    function slugify(text){
          return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
    }

    function onRepoConnected(repo) {
        vm.new.name = repo.name;
        vm.new.id = slugify(repo.name);
        vm.new.shortDescription = repo.description;

        githubAPI.decodePackageJSON(repo.owner.login, repo.name).then(function (response) {
            var packageJson = response;

            vm.new.keywords = packageJson && packageJson.keywords ? packageJson.keywords : [];

            vm.new.connectedRepos = [{
                org: repo.owner.login,
                repo: repo.name
            }];

        }).catch(function (err) {
            vm.error = 'This repo is missing a package.json which means that some features will be missing.'
            vm.new.connectedRepos = [{
                org: repo.owner.login,
                repo: repo.name
            }];
        })
    }

    function getNewText() {
        return $state.current.data.browserTitle;


    }

    function create() {
        vm.isWorking = true;

        componentsAPI.create(vm.new).then(function () {
            $state.go('componentDetail', {id: vm.new.id});
            vm.isWorking = false;
        });
    }

}
