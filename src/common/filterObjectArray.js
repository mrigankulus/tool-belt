appModule.filter('filterObjectArray', filterObjectArray)

function filterObjectArray () {
  return filterProperties
}

function filterProperties (list, val) {
  list = list || [] // if it's empty, make it an array

  if (list.length === 0 || !val) {
    return list
  }

  return list.filter(item => objectHasValue(item, val))
}

function objectHasValue(obj, term) {
  for (let prop in obj) {
    // loop through every property in the object
    if (obj.hasOwnProperty(prop) && !!obj[prop]) {
      const thisProp = obj[prop]
      
      if (_isObject(thisProp)) {
        // we have an object. recursive filter on its properties.
        if (objectHasValue(thisProp, term)) {
          return true
        }
      } else if (Array.isArray(thisProp)) {
        if (_arrayContainsValue(thisProp, term)) {
          return true
        }
      } else if (thisProp.toString().toLowerCase().indexOf(term.toLowerCase()) !== -1) {
        return true
      }
    }
  }
  return false
}

function _isObject (x) {
  return Object.prototype.toString.call(x) === '[object Object]'
}

function _arrayContainsValue (arr, val) {
  return arr.some(el => {
    if (_isObject(el)) {
      if (objectHasValue(el, val)) {
        return true
      }
    } else if (el.toString().toLowerCase().indexOf(val.toLowerCase()) !== -1) {
      return true
    }
    return false
  })
}