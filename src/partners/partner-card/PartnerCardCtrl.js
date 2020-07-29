appModule.controller('PartnerCardCtrl', makePartnerCardCtrl)

function makePartnerCardCtrl() {
    var vm = this;

    vm.getFriendlyPartnerType = getFriendlyPartnerType;

    function getFriendlyPartnerType(partner) {
        if (partner.type === 'customer' || partner.type === 'CUSTOMER') {
            return 'Customer';
        } else if (partner.type === 'vendor' || partner.type === 'VENDOR') {
            return 'Vendor';
        } else if (partner.type === 'manufacturer' || partner.type === 'MANUFACTURER') {
            return 'Manufacturer';
        }
    }
}
