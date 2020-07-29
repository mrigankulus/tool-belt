appModule.component('groupCard', {
    templateUrl: 'groups/group-card/groupCard.html',
    controller: GroupCardCtrl,
    bindings: {
        group: '<'
    }
});

function GroupCardCtrl() {
    var vm = this
}