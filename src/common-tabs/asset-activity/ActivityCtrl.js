appModule.controller('ActivityCtrl', makeActivityCtrl);

function makeActivityCtrl($scope, $timeout, jenkinsAPI, githubAPI, $q, assetState, resourcesAPI, resSVC, $filter, resFileSVC, $state, featureFlagsSVC, appsAPI, wwtEnv, $sce) {
    var vm = this;

    var hasTriggeredEventsCall = false;

    $scope.$watch('assetState', init, true);

    function init() {

        if (hasTriggeredEventsCall || !assetState.currentAsset || !assetState.currentAsset.id) {
            return;
        }

        setReadonly()

        hasTriggeredEventsCall = true;
        vm.activityHasLoaded = false;
        setActivityFeedSettings()
    }

    function setReadonly() {
        if (featureFlagsSVC.flagIsActive('activityFeedWriteInDev')) {
            return
        }

        var currentEnv = wwtEnv.getEnv()

        if (currentEnv === 'dev' || currentEnv === 'test') {
            vm.feedIsReadOnly = 'Feed is read only in Dev and Test.'
        }
    }

    function setActivityFeedSettings() {
        var resourceType = '';
        var tokenData = {
            id: assetState.currentAsset.id,
        }

        if ($state.includes('applicationDetail')) {
            resourceType = 'application'
            tokenData.appName = assetState.currentAsset.appName
        } else if ($state.includes('apiDetail')) {
            resourceType = 'api'
            tokenData.apiName = assetState.currentAsset.apiName
        } else if ($state.includes('componentDetail')) {
            resourceType = 'ui-component'
            tokenData.name = assetState.currentAsset.name
        }

        getActivity().then(function () {
            var feedSettings = {
                typeId: resourceType,
                id: assetState.currentAsset.id,
                tokenData: tokenData,
                readonly: vm.feedIsReadOnly
            }

            if ($state.includes('applicationDetail')) {
                getProfilesForApp(assetState.currentAsset).then(function (profiles) {
                    if (profiles) {
                        feedSettings.relatedResources = []

                        feedSettings.relatedResources = _.map(profiles, function (profile) {
                            return                         {
                                resourceTypeId: 'user-security-profile',
                                resourceId: profile.id
                            }
                        })
                    }
                })
            }

            if (_.size(vm.customMergeEvents)) {
                feedSettings.customMergeEvents = vm.customMergeEvents
            }

            vm.feedSettings = feedSettings
        })
    }

    function getProfilesForApp(app) {
        var requests = []

        if (!_.size(app, 'roles')) {
            return
        }

        app.roles.forEach(function (it) {
            requests.push(appsAPI.getProfilesForRole(app.id, it.id))
        })

        return $q.all(requests).then(function (responses) {
            return _.flatten(_.map(responses, function (response) {
                return _.map(response.data, function (it) {
                    return _.get(it, 'profile')
                })
            }))
        })
    }

    function getActivity() {

        var toRetrieve = [];

        var requests = [];

        assetState.currentAsset.connectedJenkinsJobs.forEach(function (job) {
            toRetrieve.push({ type: 'jenkins', jobName: job.name });
        });

        assetState.currentAsset.connectedRepos.forEach(function (it) {
            toRetrieve.push({ type: 'repo', org: it.org, repo: it.repo });
        });

        toRetrieve.forEach(function (it) {
            if (it.type === 'jenkins') {
               // requests.push(jenkinsAPI.getJobActivity('Custom Apps', it.jobName));
            } else if (it.type === 'repo') {
                requests.push(githubAPI.getEventsForRepo(it.org, it.repo));
            }
        });

        return $q.all(requests).then(function (responses) {
            var jenkinsActivity = [],
                githubActivity = [];

            responses.forEach(function (response, index) {
                var type = toRetrieve[index].type;

                if (response.data.builds) {
                    jenkinsActivity.push(mapJenkinsActivity(response.data.builds));
                } else {
                    githubActivity.push(mapGithubActivity(response.data));
                }
            });

            var events = _.flatten(jenkinsActivity).concat(_.flatten(githubActivity));

            _.remove(events, function (event) {
                return !event || !event.content
            })

            var cleanEvents = []

            events.forEach(function (it) {
                if (_.find(cleanEvents, {content: it.content}) || (!it.content && !it.comment)) {
                    return
                }

                cleanEvents.push(it)
            })

            vm.customMergeEvents = cleanEvents;

            return vm.customMergeEvents
        });
    }

    function mapGithubActivity(activity) {
        function getGithubShareText(event) {
            var html = '<br><span class="af-share-line">Shared from <a href="' + _.get(event, 'issue.html_url') + '" target="_blank"><i class="fa fa-github"></i> Github</a></span>'
            return html
        }

        return _.map(activity, function (it) {
            // not sure why I'm seeing this
            if (!it.id) {
                return {};
            }

            return {
                bumpDate: it.created_at,
                creationDate: it.created_at,
                content: {
                    inApp: _.get(it.issue, 'title') + getGithubShareText(it)
                },
                tokenData: {
                    actorUser: {
                        userName: (it.actor ? it.actor.login : '')
                    },
                    comment: {
                        title: _.get(it.issue, 'title') + getGithubShareText(it),
                        body: (_.get(it.issue, 'body') || _.get(it.issue, 'title'))
                    }
                }
            };
        });
    }

    function mapJenkinsActivity(activity) {

        function getBuildStatusText(event) {
            var status = 'no-status'

            if (event.result === 'SUCCESS') {
                status = 'success'
            } else if (event.result === 'FAILURE') {
                status = 'error'
            } else if (event.result === 'UNSTABLE') {
                status = 'warning'
            }

            return '<div class="jenkins-build-status ' + status + '"></div>'
        }

        function getShareText(event) {
            var html = '<br><span class="af-share-line">Shared from <a href="' + _.get(event, 'url') + '" target="_blank">Jenkins</a></span>'
            return html
        }

        return _.map(activity, function (it) {
            return {
                bumpDate: moment(it.timestamp).format(),
                creationDate: moment(it.timestamp).format(),
                content: {
                    inApp: '<a href="' + it.url + '" target="_blank">' + it.fullDisplayName + '</a>' + getBuildStatusText(it) + getShareText(it)
                },
                tokenData: {
                    actorUser: {
                        userName: getUserImageFromJenkinsBuild(it)
                    }
                }
            };
        });
    }

    function getUserImageFromJenkinsBuild(event) {

        if (!event.changeSet || !event.changeSet.items || !event.changeSet.items.length) {
            return;
        }

        var author = event.changeSet.items[0].author;

        if (!author) {
            return;
        }

        return _.last(author.absoluteUrl.split('/'));
    }
}
