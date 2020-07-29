appModule.controller('NewEventTypeCtrl', makeNewEventTypeCtrl);

function makeNewEventTypeCtrl($scope, $state, $timeout, resourcesAPI, notificationsAPI, amqpExchangeUtil, $rootScope, appsAPI) {
    var vm = this;
    vm.create = create;
    vm.validateTitle = validateTitle;
    vm.restoreEventType = restoreEventType;
    vm.openAddResourceTypeForm = openAddResourceTypeForm;
    vm.closeAddResourceTypeForm = closeAddResourceTypeForm;
    vm.shouldShowAddResourceTypeButton = shouldShowAddResourceTypeButton;
    vm.shouldPrefillResourceType = shouldPrefillResourceType;
    vm.shouldShowIdPathWarning = shouldShowIdPathWarning;
    vm.toggleAdvancedSettings = toggleAdvancedSettings;
    vm.setPathToResourceId = setPathToResourceId;

    $scope.amqpExchangeUtil = amqpExchangeUtil;

    vm.new = {};

    init();

    $scope.$on('resource-type-created', function (event, resourceType) {
        vm.resourceTypesOptions.push(resourceType);
        vm.new.resourceType = resourceType;

        vm.closeAddResourceTypeForm();
    });

    function init() {
        if (shouldPrefillResourceType()) {
            vm.new.resourceType = $scope.ResourceTypeDetail.resourceType;
        }

        resourcesAPI.getResourceTypes().then(function (response) {
            vm.resourceTypesOptions = response.data;
        });

        notificationsAPI.getExchanges().then(function (response) {
            var exchanges = amqpExchangeUtil.formatExchangesForSelect(response.data);

            amqpExchangeUtil.setExchangesInUsedBy(exchanges).then(function (processedExchanges) {
                vm.amqpExchangeOptions = processedExchanges;
            });
        });

        appsAPI.getApps().then(function (response) {
            vm.apps = response.data;
        });
    }

    function setDefaults() {
        vm.new.templates = [
            {
                id: "Internal-InApp",
                audience: [
                    "internal"
                ],
                content: "You have a new notification from " + vm.new.resourceType.title,
                method: [
                    "inApp"
                ]
            },
            {
                id: "Internal-Email",
                audience: [
                    "internal"
                ],
                subject: "You have a new notification!",
                content: vm.new.resourceType.title + " has updates!",
                method: [
                    "email"
                ]
            }
        ]
    }

    function create() {
        setDefaults();

        if (amqpExchangeUtil.exchangeForEventTypeIsInUse(vm.new)) {
            return;
        }

        resourcesAPI.createEventType(vm.new).then(function (response) {
            vm.isCreatingEventType = false;
            vm.hasCreatedEvent = true;

            $rootScope.$broadcast('event-type-created', response.data);

            if ($state.is('eventTypes')) {
                $timeout(function () {
                    $state.go('eventTypeDetail', {id: response.data.id});
                }, 500);
            }
        });
    }

    function restoreEventType(type) {
        var clearExchange = false;

        if (amqpExchangeUtil.exchangeForEventTypeIsInUse(type)) {
            // we need to ensure this will not create a situation that multiple event types
            // use the same exchange. this logic will be moving to the api soon.
            clearExchange = true;
        }

        resourcesAPI.restoreEventType(type.id, clearExchange).then(function (response) {
            $state.go('eventTypeDetail', {id: response.data.id});
        });
    }

    function validateTitle() {
        vm.titleAlreadyExists = false;
        vm.titleIsRestorable = false;

        if (!vm.new.title) {
            return false;
        }

        vm.isValidatingTitle = true;

        vm.new.id = slugifyText(vm.new.title);

        resourcesAPI.getEventType(vm.new.id).then(function (response) {
            vm.isValidatingTitle = false;
            vm.titleAlreadyExists = true;

            if (response.data.deleted) {
                vm.titleIsRestorable = response.data;
            }

        }, function (err) {
            // error is good here. that means the title doesn't already exist.
            vm.titleAlreadyExists = false;
            vm.isValidatingTitle = false;
            vm.titleIsRestorable = false;
        });

    }

    function slugifyText(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    function openAddResourceTypeForm() {
        vm.isAddResourceTypeForm = true;
    }

    function closeAddResourceTypeForm() {
        vm.isAddResourceTypeForm = false;
    }

    function shouldShowAddResourceTypeButton() {
        return $state.is('eventTypes');
    }

    function shouldPrefillResourceType() {
        return $state.is('resourceTypeDetail.event-types');
    }

    function setPathToResourceId() {
        // attempt to set default for pathToResourceId
        var resourceType = vm.new.resourceType;

        if (!resourceType.eventTypes || !resourceType.eventTypes.length) {
            return;
        }

        var pathsToResourceTypeIds = _.chain(resourceType.eventTypes)
            .map('pathToResourceId')
            .uniq()
            .value();

        vm.defualtPathToResourceId = pathsToResourceTypeIds[0];

        if (!vm.new.pathToResourceId) {
            vm.new.pathToResourceId = vm.defualtPathToResourceId
        }
    }

    function toggleAdvancedSettings() {
        vm.new.isViewingAdvancedSettings = !vm.new.isViewingAdvancedSettings;
    }

    function shouldShowIdPathWarning() {
        return vm.new.pathToResourceId &&
            vm.defualtPathToResourceId &&
            (vm.new.pathToResourceId !== vm.defualtPathToResourceId);
    }

}