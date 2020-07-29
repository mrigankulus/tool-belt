appModule.controller('SharedSocketsCtrl', makeSharedSocketsCtrl);

function makeSharedSocketsCtrl(userPermissionsAPI, $scope, $timeout, envExtended, sharedSocketsApi, WwtNgSocketChannel, wwtFocusPanelSVC, $log) {
    var vm = this;

    vm.shouldShowShowMore = shouldShowShowMore;
    vm.showMore = showMore;
    vm.socketsLimit = 24;
    vm.getChannelsForUserSockets = getChannelsForUserSockets;
    vm.mapSocketsByUser = mapSocketsByUser;
    vm.openChannelDetail = openChannelDetail;
    vm.openUserSocketsPanel = openUserSocketsPanel;

    vm.sockets = [];

    $scope.envExtended = envExtended;

    init();

    function init() {
        userPermissionsAPI.canViewSockets().then(function (response) {
            vm.canViewSockets = response;
            listen();
            // the timeout helps remove a bit of confusion by allowing (hopefully) our current
            // socket to get setup before we retrieve/listen...seeing race conditions otherwise.
            $timeout(function () {
                sharedSocketsApi.getSharedSockets().then(function (response) {
                    vm.sockets = response.data;
                    // todo: the sockets that we open here for ourselves won't be authed when we
                    // open them...so they won't have a user name at this moment.
                    // we'll need to figure something out with that.
                    mapSocketsByUser();
                });
            }, 1000);
        });
    }

    function mapSocketsByUser() {
        vm.socketsByUser = [];

        vm.socketsByUserObj = _.groupBy(vm.sockets, function (socket) {
            return socket.user ? socket.user.userName : '';
        });

        _.forIn(vm.socketsByUserObj, function (it) {
            if (!it) {
                return;
            }

            vm.socketsByUser.push(it)
        });
    }

    function getChannelsForUserSockets(sockets) {
        if (!sockets || !sockets.length) {
            return [];
        }

        var channels = [];

        sockets.forEach(function (it) {
            if (!it.channels || !it.channels.length) {
                return;
            }

            it.channels.forEach(function (channel) {
                channels.push(channel);
            });
        });

        return _.uniq(channels);
    }

    function listen() {
        var socketOpened = new WwtNgSocketChannel('wwt-shared-socket-opened', $scope);
        var socketClosed = new WwtNgSocketChannel('wwt-shared-socket-closed', $scope);
        var socketedAuthed = new WwtNgSocketChannel('wwt-shared-socket-authenticated', $scope);
        var socketChannelAdded = new WwtNgSocketChannel('wwt-shared-socket-channel-added', $scope);

        socketOpened.onMessage = function (eventData) {
            $timeout(function () {
                vm.sockets.push(eventData.data.socket);
            });
        };

        socketChannelAdded.onMessage = function (eventData) {
            // I think we can just reuse this sucker since the socket has the new channel
            // in it.
            onNewAuthedSocket(eventData.data.socket);
        };

        socketedAuthed.onMessage = function (eventData) {
            onNewAuthedSocket(eventData.data.socket);
        };

        socketClosed.onMessage = function (eventData) {
            onSocketClosed(eventData.data.socket[0]);
        };
    }

    function onSocketClosed(socket) {
        $timeout(function () {
            _.remove(vm.sockets, {id: socket.id});
            mapSocketsByUser();
        });
    }

    function onNewAuthedSocket(socket) {
        $timeout(function () {
            var matchingSocket = _.find(vm.sockets, {id: socket.id});

            if (matchingSocket) {
                matchingSocket.user = socket.user;
            } else {
                vm.sockets.push(socket);
            }

            mapSocketsByUser();
        });
    }

    function shouldShowShowMore() {
        return vm.socketsByUser && !vm.socketsSearchText && (vm.socketsByUser.length > vm.socketsLimit);
    }

    function showMore() {
        // todo: should make this pagination rather than show all...
        // there could be a bunch
        vm.socketsLimit += vm.socketsByUser.length;
    }

    function openChannelDetail(channel) {
        vm.activeChannel = channel;

        // required to get activeChannel set before trying to open panel
        $timeout(function () {
            wwtFocusPanelSVC.togglePanel('socketChannelDetailPanel');
        }, 50);
    }

    function openUserSocketsPanel(userSockets) {
        vm.activeUserSockets = userSockets;

        $timeout(function () {
            wwtFocusPanelSVC.togglePanel('userScoketsPanel')
        }, 50);
    }
}