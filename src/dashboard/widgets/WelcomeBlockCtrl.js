appModule.controller('WelcomeBlockCtrl', makeWelcomeBlockCtrl);

function makeWelcomeBlockCtrl($scope, $state) {
    var vm = this;

    vm.isViewingAboutModal = isViewingAboutModal;
    vm.isOpen = isOpen;
    vm.closeWelcome = closeWelcome;

    var LOCAL_STORAGE_KEY = 'dtb-has-dismissed-welcome-message';

    function isViewingAboutModal() {
        return $state.is('dashboard.about');
    }

    function isOpen() {
        return !window.localStorage[LOCAL_STORAGE_KEY];
    }

    function closeWelcome() {
        window.localStorage[LOCAL_STORAGE_KEY] = true;
    }

}