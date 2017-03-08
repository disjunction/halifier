const R = require('ramda')
const naturalCompare = require('string-natural-compare')

class ArrayDataProvider {
  constructor (array) {
    this.array = array || []
  }

  /**
   * executes query defined in listMeta
   * and returns the selected records and the transformed listMeta
   * @return [selected, newListMeta]
   */
  runListQuery (listMeta) {
    const query = listMeta.query || {}
    let source = this.array
    if (listMeta.order) {
      source = R.sort(
        (a, b) => naturalCompare(a[listMeta.order], b[listMeta.order]),
        source
      )
    }

    const newListMeta = Object.assign({}, listMeta)

    let matched = R.filter(R.whereEq(query), source)
    newListMeta.stats = {total: matched.length}
    matched = matched.slice(listMeta.offset, listMeta.offset + listMeta.limit)
    newListMeta.stats.returned = matched.length

    return Promise.resolve([matched, newListMeta])
  }
}

module.exports = ArrayDataProvider
