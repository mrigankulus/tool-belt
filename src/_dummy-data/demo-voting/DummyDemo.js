appModule.factory('DummyDemo', dummyDemoFactory)

function dummyDemoFactory($http, wwtEnv, $log, $q, $timeout) {
    var demoDate = moment().format('YYYY-MM-DD')
    var Demo = function (demo) {
        var self = this

        _.forIn(demo, function (value, key) {
            self[key] = value
        })
    }

    Demo.findForToday = function (groupId, options) {
        var url = wwtEnv.getApiRouterUrl() + '/associations/atc-dev-demo/' + demoDate
        return $http.get(url).then(function (response) {
            var presenters = _.map(_.get(response.data, 'data'), function (association) {
              return _.find(_.get(association, 'resources'), {type:'atc-dev-demo-presenter'})
            })

            if (!presenters) {
              presenters = []
            }

            response.data = new Demo({id: demoDate, presenters: presenters})
            return response
        })
    }

    Demo.prototype.getVotes = function () {
        var self = this
        var url = wwtEnv.getApiRouterUrl() + '/activity-feeds-api/events?resourceTypeId=atc-dev-demo&resourceId=' + demoDate + '&itemsPerPage=1000'
        return $http.get(url).then(function (response) {
            if (response.data) {
              self.events = uniqifyEvents(response.data)
            } else {
              self.events = []
            }

            if (_.size(self.presenters)) {
              self.presenters.forEach(function (presenter) {
                  presenter.votes = _.filter(self.events, function (event) {
                    return _.get(event, 'presenterName').toLowerCase() == presenter.id.toLowerCase()
                  })
                  presenter.votes = _.map(presenter.votes, function (vote) {
                    return _.get(vote, 'phoneNumber')
                  })
                  presenter.voteCount = _.size(presenter.votes)
              })
            }
            return response
        })
    }

    function uniqifyEvents(events) {
      let uniqified = []
      if (!_.size(events)) {
        return events
      }

      _.forEach(events, function (event) {
        if (!_.find(uniqified, {phoneNumber: _.get(event, 'tokenData.phoneNumber')})) {
          uniqified.push({
            phoneNumber: _.get(event, 'tokenData.phoneNumber'),
            presenterName: _.get(event, 'tokenData.presenterName')
          })
        }
      })

      return uniqified
    }

    Demo.prototype.addPresenter = function (presenterName) {
        var self = this
        var url = wwtEnv.getApiRouterUrl() + '/associations/atc-dev-demo/' + demoDate
        var newPresenterResource = {
          id: presenterName,
          type: 'atc-dev-demo-presenter'
        }

        return $http.post(url, newPresenterResource).then(function (response) {
            self.presenters.push(newPresenterResource)
            return response
        })
    }

    Demo.prototype.countResourceEvent = function (event) {
        var self = this
        // ensure the date is correct
        if (_.get(event, 'resource.id') != self.id) {
          $log.error('Received event for demo other than today.')
          $log.error(event)
          return
        }

        var presenter = _.get(event, 'tokenData.presenterName')
        var targetPresenter = _.find(self.presenters, {id: presenter})

        if (!targetPresenter) {
          $log.error('Received event for presenter not listed.')
          return
        }

        if (!targetPresenter.votes) {
          targetPresenter.votes = []
        }

        if (!targetPresenter.voteCount) {
          targetPresenter.voteCount = 0
        }

        self.removeExistingVote(_.get(event, 'tokenData.phoneNumber'))

        targetPresenter.votes.push(_.get(event, 'tokenData.phoneNumber'))
        targetPresenter.voteCount++
        return
    }

    Demo.prototype.removeExistingVote = function (phoneNumber) {
      // if this phone number has already voted, this will remove
      // their previous vote.
      var self = this
      var targetPresenter = _.find(self.presenters, function (presenter) {
        return _.includes(presenter.votes, phoneNumber)
      })

      if (targetPresenter && targetPresenter.voteCount) {
        _.remove(targetPresenter.votes, function (vote) {
          return vote == phoneNumber
        })

        targetPresenter.voteCount--
      }

      return
    }

    Demo.prototype.runLoad = function () {
      var self = this

      // start with one to get things rolling
      $http.post(wwtEnv.getApiRouterUrl() + '/events/wwt.atcDevDemo.vote/%23', {
          presenterName: self.presenters[0].id,
          phoneNumber: 1,
          id: demoDate
      }).then(function () {
          $timeout(function () {
              _.range(20).forEach(function (it) {
                var randomPresenter = self.presenters[Math.floor(Math.random() * self.presenters.length)]
                if (!randomPresenter.id) {
                  return
                }

                $http.post(wwtEnv.getApiRouterUrl() + '/events/wwt.atcDevDemo.vote/%23', {
                  presenterName: randomPresenter.id,
                  phoneNumber: 1 + it,
                  id: demoDate
                })
              })
          }, 300)
      })
    }

    Demo.prototype.clearData = function () {
      // clear all data for the demo.
      var self = this
      return $q.all([self.clearAssociations(), self.clearVotes()])
    }

    Demo.prototype.clearAssociations = function () {
      var url = wwtEnv.getApiRouterUrl() + '/associations/atc-dev-demo/' + demoDate
      return $http.get(url).then(function (response) {
          var associationIds = _.map(response.data.data, 'id')
          var requests = []

          _.forEach(associationIds, function (associationId) {
            if (associationId) {
              requests.push($http.delete(wwtEnv.getApiRouterUrl() + '/associations/' + associationId))
            }
          })

          return $q.all(requests)
      })
    }

    Demo.prototype.clearVotes = function () {
      var url = wwtEnv.getApiRouterUrl() + '/activity-feeds-api/events?resourceTypeId=atc-dev-demo&resourceId=' + demoDate + '&itemsPerPage=1000'
      return $http.get(url).then(function (response) {
          console.log(response.data)
          var eventIds = _.map(response.data, '_id')
          var requests = []

          _.forEach(eventIds, function (eventId) {
            if (eventId) {
              requests.push($http.delete(wwtEnv.getApiRouterUrl() + '/activity-feeds-api/events/' + eventId))
            }
          })

          return $q.all(requests)
      })
    }

    return Demo
}
