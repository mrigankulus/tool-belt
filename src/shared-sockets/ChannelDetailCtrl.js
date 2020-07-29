appModule.controller('ChannelDetailCtrl', makeChannelDetailCtrl);

function makeChannelDetailCtrl($scope, $timeout, WwtNgSocketChannel) {
    var vm = this;

    init();

    function init() {
        var channel = new WwtNgSocketChannel($scope.Sockets.activeChannel, $scope);

        vm.events = [];

        channel.onMessage = function (eventData) {
            $timeout(function () {
                vm.events.push(eventData);
            }, 200);
        };
    }
}