appModule.controller('ComponentVersionsCtrl', makeComponentVersionsCtrl)

function makeComponentVersionsCtrl($state, $timeout, componentsAPI, userPermissionsAPI) {
    var vm = this

    vm.getTagReleaseVersionUrl = getTagReleaseVersionUrl
    vm.getPublishedVersionMatches = getPublishedVersionMatches
    vm.shouldShowBlankSlate = shouldShowBlankSlate
    vm.versionsLimitStart = 5
    vm.versionsLimit = vm.versionsLimitStart
    vm.showAllVersions = vm.showAllVersions

    init()

    function init() {
        vm.isLoadingVersions = true
        vm.isLongLoad = false

        var loadTimer = $timeout(function () {
            vm.isLongLoad = true
        }, 700)

        componentsAPI.getVersionsByComponentId($state.params.id).then(function (response) {
            $timeout.cancel(loadTimer)
            vm.isLongLoad = false

            vm.componentVersions = response.data

            vm.isLoadingVersions = false
        }).catch(function (err) {
            $timeout.cancel(loadTimer)
            vm.isLoadingVersions = false
            vm.isLongLoad = false
            vm.error = 'Error retrieving versions from Artifactory'
        })

    }

    function getTagReleaseVersionUrl(version) {
        return `https://github.wwt.com/custom-apps/${vm.componentVersions.name}/releases/tag/v${version}`
    }

    function getPublishedVersionMatches(version) {
        return version === _.find(vm.componentVersions.publishedVersions)
    }

    function shouldShowBlankSlate() {
        return !vm.error && !vm.isLoadingVersions && (!vm.componentVersions || !vm.componentVersions.versions || !vm.componentVersions.versions.length)
    }

    function showAllVersions() {
        vm.versionsLimit += vm.componentVersions.length
    }

}
