appModule.factory('githubAPI', makegithubAPI);

function makegithubAPI ($http, $q, base64, messenger, rootApiUrl) {
    var githubAPI = {};

    const ghProxy = `${rootApiUrl}/github-proxy`

    githubAPI.getRepo = function (user, repo) {
      return $http.get(`${ghProxy}/repos/${user}/${repo}`, {cache: true})
    };

    githubAPI.getRepoOpenIssues = function (user, repo) {
      return $http.get(`${ghProxy}/repos/${user}/${repo}/issues?open=true`, {cache: true})
    };

    githubAPI.getRepoOpenPRs = function (user, repo) {
      return $http.get(`${ghProxy}/repos/${user}/${repo}/pulls`, { cache: true })
    };

    githubAPI.getReadme = function (user, repo) {
      return $http.get(`${ghProxy}/repos/${user}/${repo}/readme`, { cache: true })
    };

    githubAPI.decodeReadme = function (user, repo) {
        return githubAPI.getReadme(user, repo).then(function (response) {
            return base64.decode(response.data.content);
        });
    };

    githubAPI.getFile = function (user, repo, file) {
      return $http.get(`${ghProxy}/repos/${user}/${repo}/contents/${file}`, { cache: true, willHandleErrors: true })
    }

    githubAPI.getAndDecodeFile = function (user, repo, file) {
      return githubAPI.getFile(user, repo, file).then(response => {
        return base64.decode(response.data.content)
      })
    };

    githubAPI.getPackageJSON = function (user, repo) {
      return githubAPI.getFile(user, repo, 'package.json')
    };

    githubAPI.decodePackageJSON = function (user, repo) {
        return githubAPI.getPackageJSON(user, repo).then(function (response) {
            return JSON.parse(base64.decode(response.data.content))
        }).catch(function (err) {
          return $q.reject(err)
        })
    };

    githubAPI.searchRepos = function (searchTerm) {
      return $http.get(`${ghProxy}/search/repositories?searchTerm=${searchTerm}`, { cache: true })
    };

    githubAPI.getEventsForOrg = function (org) {
      return $http.get(`${ghProxy}/orgs/${org}/events`, { cache: true })
    };

    githubAPI.getEventsForRepo = function (org, repo) {
      return $http.get(`${ghProxy}/repos/${org}/${repo}/issues/events`, { cache: true }).then(function (response) {
        return githubAPI.getRepoOpenPRs(org, repo).then(function (prsResponse) {
          response.data = response.data.concat(_.map(prsResponse.data, function (it) {
            it.issue = it
            it.actor = it.user

            return it
          }))

          return response
        })
      })
    };

    githubAPI.processMarkdown = function (rawMarkdown) {
      return $http.post(`${ghProxy}/markdown/raw`, rawMarkdown, {
        cache: true,
        headers: {
          "Content-Type": "text/plain"
        }
      })
    };

    return githubAPI;
}
