const querystring = require('querystring')
const meta = require('./meta')

class AbstractItemHalifier {
  /**
   * @param {Object} app - provides app context
   * @param {Object} opts
   * @param {String} opts.baseUrl - entities base url, e.g. /people
   * @param {String} [opts.name] - item name
   */
  constructor (app, opts) {
    Object.assign(this, {app, opts})
  }

  getId (item) {
    return this.opts.idFieldName ? item[this.opts.idFieldName] : item.id
  }

  makeLinkForListFromQuery (query) {
    return this.opts.baseUrl + '?' + querystring.stringify(query)
  }

  makeNextPrevLinks (list, proto) {
    const result = {}
    const meta = proto._listMeta
    if (!meta.query || !meta.stats) {
      throw new Error('default implementation requires _listMeta.query and _listMeta.stats')
    }
    const query = Object.assign({limit: meta.limit}, meta.query)

    if (meta.offset > 0) {
      query.offset = Math.max(0, meta.offset - meta.limit)
      if (!meta.offset) {
        delete query.offset
      }
      result.prev = {
        href: this.makeLinkForListFromQuery(query)
      }
    }

    if (meta.offset + list.length < meta.stats.total) {
      query.offset = meta.offset + meta.limit
      result.next = {
        href: this.makeLinkForListFromQuery(query)
      }
    }

    return result
  }

  getLinksForSingle (item) {
    return {
      self: {
        href: this.opts.baseUrl + '/' + this.getId(item),
        title: 'get single ' + this.opts.name
      }
    }
  }

  makeProtoFromReq (req) {
    const listMeta = meta.makeListMeta(req.query, this.opts)
    return {
      _listMeta: listMeta
    }
  }

  getLinksForList (list, proto) {
    return this.makeNextPrevLinks(list, proto)
  }

  getListName () {
    return this.opts.name + 's'
  }

  /**
   * @return {Promise}
   */
  getEmbeddedForList (list, proto) {
    return Promise.all(
      list.map(item => this.halifyListItem(item))
    )
      .then(embeddedArray => ({
        [this.getListName()]: embeddedArray
      }))
  }

  /**
   * returns a HAL representation of an item
   * in many cases embedded list items have a shorter
   * list of properties than when requesting requesting
   * a single item. This is why it has a separate method
   * @oaram {Object} item
   * @return {Promise}
   */
  halifyListItem (item) {
    return this.halifyItem(item)
  }

  /**
   * @return {Promise}
   */
  halifyItem (item) {
    return Promise.resolve(Object.assign(
      {_links: this.getLinksForSingle(item)},
      item
    ))
  }

  /**
   * @return {Promise}
   */
  halifyList (list, proto) {
    return this.getEmbeddedForList(list, proto)
      .then(embedded => Object.assign(
        {
          _links: this.getLinksForList(list, proto),
          _embedded: embedded
        },
        proto
      ))
  }
}

module.exports = AbstractItemHalifier
