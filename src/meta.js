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
    x.limit ? {limit: parseInt(x.limit)} : undefined,
    x.offset ? {offset: parseInt(x.offset)} : undefined
  )
}

function makeListMeta (query, options) {
  options = options || {}
  query = query || {}
  const listMeta = {
    limit: parseInt(query.limit || (options.listMeta && options.listMeta.limit) || 20),
    offset: parseInt(query.offset || (options.listMeta && options.listMeta.offset) || 0)
  }

  const order = query.order || options.order
  if (order) {
    listMeta.direction = query.direction || options.direction || 'asc'
    listMeta.order = String(order).split(',').map(orderField => {
      const parts = orderField.split(' ')
      return {[parts[0]]: R.nth(1, parts) || listMeta.direction}
    })
  }

  query = Object.assign({}, query)
  delete query.limit
  delete query.offset
  delete query.order
  delete query.direction
  listMeta.query = query

  return listMeta
}

module.exports = {
  extrasFromProps,
  extrasFromHyphened,
  makeListMeta,
  whereFromHyphened
}
