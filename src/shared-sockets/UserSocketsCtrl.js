appModule.controller('UserSocketsCtrl', makeUserSocketsCtrl);

function makeUserSocketsCtrl($scope, WwtNgSocketChannel) {
    var vm = this;

    init();

    function init() {
        // vm.sockets = $scope.Sockets.activeUserSockets;

        // todo: listen for new ones
        // var channel = new WwtSharedSocketChannel('wwt-shared-socket-authenticated', $scope);

        // channel.onMessage = function (eventData) {
        //     var socket = eventData.data.socket;

        //     if (socket.user.userName === vm.sockets[0].user.userName) {
        //         vm.sockets.push(socket);
        //     }
        // };
    }
}