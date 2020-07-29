appModule.controller('VisionConnectCtrl', makeVisionConnectCtrl);

function makeVisionConnectCtrl($scope, visionAPI) {
    var vm = this;

    vm.connectedBoard = '';
    vm.newBoard = $scope.board ? _.clone($scope.board) : {};
    vm.onSelectVisionGroup = onSelectVisionGroup;

    vm.connectBoard = connectBoard;
    vm.testConnection = testConnection;
    vm.onCancel = onCancel;

    init();

    function init() {
        visionAPI.getGroups().then(function (response) {
            vm.availableVisionGroups = response.data;

            if ($scope.board && $scope.board.id) {
                vm.newBoard = {
                    id: $scope.board.id,
                    name: $scope.board.name
                };

                $scope.selectedVisionGroup = vm.newBoard;
            }
        });
    }

    function connectBoard() {
        return testConnection().then(function (response) {
            vm.connectedBoard = response;
            // note that $scope.board would be the original, given board.
            // that will be useful for updating.
            $scope.onBoardConnected(response, $scope.board);
        });
    }

    function onSelectVisionGroup(group) {
        vm.newBoard = {
            id: group.id,
            name: group.name
        }
    }

    function testConnection() {
        vm.isTestingConnection = true;
        vm.connectionSucceeded = false;

        return visionAPI.getBoard(vm.newBoard.id).then(function (response) {
            vm.isTestingConnection = false;
            vm.connectionSucceeded = true;
            return response.data;
        }, function () {
            vm.isTestingConnection = true;
            vm.connectionSucceeded = false;
        });
    }

    function onCancel() {
        if ($scope.onCancelBoard) {
            $scope.onCancelBoard(vm.newBoard);
        }

        return;
    }
}
