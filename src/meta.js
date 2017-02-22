const R = require('ramda')

function extrasFromHyphened (x) {
  return R.mergeAll(
    x['-l'] ? {limit: x['-l']} : undefined,
    x['-o'] ? {offset: x['-o']} : undefined
  )
}

function pushHyphenedCriterion (result, parts, value) {
  if (parts[0] === 'eq') {
    result[parts[1]] = value
  }
}

function whereFromHyphened (x) {
  const result = {}
  x.keys().map(key => {
    const parts = key.split(/-/)
    if (parts && parts === 2) {
      pushHyphenedCriterion(result, parts, x[key])
    }
  })
  return result
}

function extrasFromProps (x) {
  return R.mergeAll(
    x.limit ? {limit: x.limit} : undefined,
    x.offset ? {offset: x.offset} : undefined
  )
}

module.exports = {
  extrasFromProps,
  extrasFromHyphened,
  whereFromHyphened
}
