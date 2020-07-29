appModule.controller('GithubActivityCtrl', makeGithubActivityCtrl);

function makeGithubActivityCtrl($scope, githubAPI) {
    var vm = this;

    var org = $scope.org || 'custom-apps';
    var githuURL = 'https://github.wwt.com';

    var DEFAULT_EVENT_TYPES = [
        {name: 'CreateEvent', active: true},
        {name: 'DeleteEvent'},
        {name: 'IssueCommentEvent', active: true},
        {name: 'IssuesEvent', active: true},
        {name: 'PullRequestReviewCommentEvent', active: true},
        {name: 'PullRequestEvent'},
        {name: 'PushEvent'}
    ];

    var EVENT_TYPES_KEY = 'dtb-github-activity-event-types';

    // used to identify if we're on the dashboard, or elsewhere.
    // we should probably considering converting this to a directive at some point.
    $scope.isDashboard = true;

    vm.getTemplateUrl = getTemplateUrl;
    vm.showMore = showMore;
    vm.shouldShowShowMore = shouldShowShowMore;
    vm.getLinkToUser = getLinkToUser;
    vm.getRepoLink = getRepoLink;
    vm.getCommitLink = getCommitLink;
    vm.getBranchUrl = getBranchUrl;
    vm.shouldShowEvent = shouldShowEvent;
    vm.saveEventSettings = saveEventSettings;

    vm.activityLimit = $scope.activityLimit || 10;

    init();

    function init() {
        getSupportedEvents();
        getActivity();
    }

    function getActivity() {
        githubAPI.getEventsForOrg(org).then(function (response) {
            vm.githubFeed = response.data;
        });
    }

    function getTemplateUrl(item) {
        return 'dashboard/widgets/github-activity/_' + item.type + '.html';
    }

    function showMore() {
        vm.activityLimit += ($scope.activityLimit || 10);
    }

    function shouldShowShowMore() {
        var filteredFeed = _.filter(vm.githubFeed, shouldShowEvent);

        return vm.githubFeed && (filteredFeed.length > vm.activityLimit);
    }

    function getLinkToUser(user) {
        return githuURL + '/' + user.login;
    }

    function getRepoLink(repoName) {
        return githuURL + '/' + repoName;
    }

    function getCommitLink(item, commit) {
        return githuURL + '/' + item.repo.name + '/commit/' + commit.sha;
    }

    function getBranchUrl(item, branchName) {
        return githuURL + '/' + item.repo.name + '/tree/' + branchName;
    }

    function shouldShowEvent(event) {
        return _.find(vm.eventTypes, {'name': event.type, 'active': true});
    }

    function getSupportedEvents() {
        if (!window.localStorage[EVENT_TYPES_KEY]) {
            window.localStorage[EVENT_TYPES_KEY] = JSON.stringify(DEFAULT_EVENT_TYPES);
        }

        vm.eventTypes = JSON.parse(window.localStorage[EVENT_TYPES_KEY]);

        return vm.eventTypes;
    }

    function saveEventSettings() {
        window.localStorage[EVENT_TYPES_KEY] = JSON.stringify(vm.eventTypes);
        getActivity();
    }

}