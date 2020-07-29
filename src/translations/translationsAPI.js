appModule.factory('translationsAPI', makeTranslationsAPI)

function makeTranslationsAPI ($http, wwtEnv) {
  var baseURL = wwtEnv.getApiForwardUrl() + '/translations'
  
  function list() {
    return $http.get(baseURL)
  }
  
  function findByResource(resourceId) {
    return $http.get(baseURL + '?resource=' + resourceId)
  }
  
  function update(translation) {
    var update = {
      entries: translation.entries,
      resource: translation.resource
    }
    
    return $http.put(baseURL + '/' + translation.id, update).then(function (response) {
      return response
    })
  }
  
  function create(translation) {
    return $http.post(baseURL, translation).then(function (response) {
      return response
    })
  }
  
  function remove(translation) {
    return $http.delete(baseURL + '/' + translation.id).then(function (response) {
      return response
    })
  }
  
  return {
    list,
    findByResource,
    update,
    create,
    remove
  }
}
