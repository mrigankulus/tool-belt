appModule.controller('TranslationsCtrl', makeTranslationsCtrl)

function makeTranslationsCtrl($scope, assetState, $state, translationsAPI, translationsFactory, envExtended, wwtEnv) {
    const vm = this

    $scope.assetState = assetState
    $scope.envExtended = envExtended

    $scope.$watch('assetState.currentAsset', init, true)

    vm.toggleCreateForm = toggleCreateForm
    vm.addNew = addNew
    vm.deleteTranslation = deleteTranslation
    vm.updateTranslation = updateTranslation
    vm.openEditEntry = openEditEntry
    vm.addNewMapping = addNewMapping
    vm.removeMapping = removeMapping
    vm.updateMapping = updateMapping
    vm.getIdSuggestion = getIdSuggestion

    init()

    function init(newData, oldData) {
        if (newData && newData.isLoading) {
            return
        }

        var currentEnv = wwtEnv.getEnv()

        if (currentEnv !== 'local' && currentEnv !== 'dev') {
            vm.shouldShowComingSoon = true
            return
        }

        if (vm.hasLoaded) {
            return
        }

        vm.newTranslation = {}
        vm.mappingFilterTerm = ''
        vm.localeCodes = translationsFactory.getLocaleCodes()
        getTranslations()
    }

    function getTranslations() {
        var resource = {}

        if ($state.includes('apiDetail')) {
            resource = {
                type: 'api',
                id: $state.params.id
            }
        } else {
            resource = {
                type: 'application',
                id: $state.params.id
            }
        }

        vm.resourceKey = `${resource.type}-${resource.id}`

        translationsAPI.findByResource(vm.resourceKey).then(res => {
            if (res.data.length > 0) {
                vm.translation = res.data[0]
                mapEntries()
            } else {
                vm.translation = {
                    entries: {},
                    mappings: []
                }
            }
            vm.hasLoaded = true
        })
    }

    function mapEntries() {
        vm.translation.mappings = []

        if (vm.translation.entries) {
            Object.keys(vm.translation.entries).forEach(locale => {
                Object.keys(vm.translation.entries[locale]).forEach(mapping => {
                    vm.translation.mappings.push({
                        locale,
                        key: mapping,
                        value: vm.translation.entries[locale][mapping],
                        isEditing: false
                    })
                })
            })
        }
    }

    function addNew() {
        const data = Object.assign({
            entries: {},
            resource: vm.resourceKey
        }, vm.newTranslation)

        translationsAPI.create(data).then(response => {
            vm.translation = response.data
            if (vm.translation.entries) {
                mapEntries()
            }
            toggleCreateForm()
        }).catch(err => {
            toggleCreateForm()
            console.error(err)
        })
    }

    function toggleCreateForm() {
        vm.newTranslation = {
            id: getIdSuggestion()
        }
        vm.showCreateForm = !vm.showCreateForm
    }

    function openEditEntry(entry) {
        entry.tempKey = entry.key
        entry.tempValue = entry.value
        entry.isEditing = true
    }

    function getIdSuggestion() {
        let title = assetState.currentAsset.appName || assetState.currentAsset.apiName
        return _.kebabCase(title)
    }

    function addNewMapping() {
        const nm = vm.newMapping
        const locale = nm.locale
        const key = nm.key
        const value = nm.value

        // if this is our first entry, make sure it doesn't blow up
        if (!vm.translation.entries) {
            vm.translation.entries = {}
        }

        // same for the mappings
        if (!vm.translation.mappings) {
            vm.translation.mappings = []
        }

        // check if we are overriding an existing value
        const ind = vm.translation.mappings.findIndex(it => it.locale === locale && it.key === key)
        if (ind >= 0) {
            // we have an entry at this locale/key pair, so update it
            vm.translation.mappings[ind].value = value
        } else {
            vm.translation.mappings.push(nm)
        }

        // make sure we at least have an empty object defined at this locale so we can put the key/value there
        if (vm.translation.entries[locale] === undefined) {
            vm.translation.entries[locale] = {}
        }

        vm.translation.entries[locale][key] = value // NOTE: this will override an existing value if one exists at the same locale/key
        vm.newMapping = {}
        vm.isAddingTranslation = false
        updateTranslation()
    }

    function removeMapping(mapping) {
        const ind = vm.translation.mappings.findIndex(it => it.locale === mapping.locale && it.key === mapping.key)
        vm.translation.mappings.splice(ind, 1)
        delete vm.translation.entries[mapping.locale][mapping.key]

        // now that we have deleted the key at that locale, if none remain we should also delete that locale
        if (Object.keys(vm.translation.entries[mapping.locale]).length === 0) {
            delete vm.translation.entries[mapping.locale]
        }
        updateTranslation()
    }

    function updateMapping(mapping) {
        if (mapping.key !== mapping.tempKey) {
            delete vm.translation.entries[mapping.locale][mapping.key]
        }

        mapping.key = mapping.tempKey
        mapping.value = mapping.tempValue

        vm.translation.entries[mapping.locale][mapping.key] = mapping.value

        mapping.isEditing = false
        updateTranslation()
    }

    function updateTranslation() {
        translationsAPI.update(vm.translation).then(response => {
            vm.translation = response.data
            mapEntries()
        }).catch(err => {
            console.error(err)
        })
    }

    function deleteTranslation() {
        vm.showDeletePrompt = false
        translationsAPI.remove(vm.translation).then(response => {
            vm.translation = {}
        }).catch(err => {
            console.error(err)
        })
    }
}
