appModule.controller('PostRefreshCtrl', makePostRefreshCtrl)

function makePostRefreshCtrl(appsAPI, $timeout) {
    var vm = this

    vm.getData = getData
    vm.data = {}
    vm.onCopy = onCopy
    vm.upload = upload
    vm.processPastedContent = processPastedContent
    vm.state = {}
    vm.runUpdate = runUpdate
    vm.getImportProgress = getImportProgress

    function getData() {
        appsAPI.getApps().then(function (response) {
            vm.data.applications = _.map(response.data, function (app) {
                delete app.permissions
                delete app.roles
                return app
            })
        })
    }

    function onCopy(e) {
        e.clearSelection();
        vm.shouldShowCopiedMessage = true;

        $timeout(function () {
            vm.shouldShowCopiedMessage = false;
        }, 3000);
    }

    function upload() {
        vm.isUploading = true
    }

    function processPastedContent() {
        if (!vm.pasteArea) {
            return
        }

        var parsedData = ''

        try {
            parsedData = JSON.parse(vm.pasteArea)
        } catch(err) {
            vm.state.badJson = true
            return
        }

        if (!parsedData.applications) {
            vm.state.badJson = true
        }

        vm.willUpdateList = []

        appsAPI.getApps().then(function (response) {
            var currentApps = response.data

            parsedData.applications.forEach(function (it) {
                var currentDefinition = currentApps.find(function (app) {
                    return app.appName === it.appName
                })

                if (currentDefinition && currentDefinition.appLocation !== it.appLocation) {
                    var updateStory = {
                        appName: it.appName,
                        iconName: it.iconName,
                        currentUrl: currentDefinition.appLocation,
                        currentId: currentDefinition.id,
                        newUrl: it.appLocation
                    }

                    vm.willUpdateList.push(updateStory)
                }
            })
        })

        return
    }

    function runUpdate() {
        vm.state.isImporting = true
        vm.state.itemCount = vm.willUpdateList.length
        vm.importedCount = 0

        vm.willUpdateList.forEach(function (it) {
            it.isImporting = true

            var updatedVersion = {
                id: it.currentId,
                appLocation: it.newUrl
            }

            appsAPI.update(updatedVersion).then(function () {
                it.isImporting = false
                it.importWasSuccessful = true
                vm.importedCount++
            })
        })
    }

    function getImportProgress() {
        return ((vm.state.importedCount / vm.state.itemCount) * 100).toFixed();
    }
}