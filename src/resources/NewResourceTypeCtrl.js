appModule.controller('NewResourceTypeCtrl', makeNewResourceTypeCtrl);

function makeNewResourceTypeCtrl($scope, $state, resourcesAPI, $timeout, $rootScope, wwtEnv) {
    var vm = this;

    vm.new = {};

    vm.create = create;
    vm.validateTitle = validateTitle;
    vm.formIsValid = formIsValid;
    vm.restoreResourceType = restoreResourceType;
    vm.closeAddResourceTypeForm = closeAddResourceTypeForm;

    function create() {
        vm.isCreatingResourceType = true;

        resourcesAPI.createResourceType(vm.new).then(function (response) {
            vm.isCreatingResourceType = false;
            vm.hasCreatedResource = true;

            $rootScope.$broadcast('resource-type-created', response.data);

            if ($state.is('resourceTypes')) {
                $timeout(function () {
                    $state.go('resourceTypeDetail', {id: response.data.id});
                }, 500);
                return;
            }

            // close panel here
        });
    }

    function formIsValid() {
        return !vm.titleAlreadyExists &&
                vm.new.title &&
                vm.new.id &&
                vm.new.description;
    }

    function restoreResourceType(type) {
        resourcesAPI.restoreResourceType(type.id).then(function (response) {
            $state.go('resourceTypeDetail', {id: response.data.id});
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

        resourcesAPI.getResourceType(vm.new.id).then(function (response) {
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

    function closeAddResourceTypeForm() {
        if ($scope.ResourceTypes) {
            $scope.ResourceTypes.closeAddResourceTypeForm();
        } else if ($scope.EventTypeDetail) {
            $scope.EventTypeDetail.closeAddResourceTypeForm();
        } else {
            $scope.NewEventType.closeAddResourceTypeForm();
        }
    }

    function slugifyText(text) {
          return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
    }

}
