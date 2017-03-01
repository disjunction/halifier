const querystring = require('querystring')
const meta = require('./meta')

class AbstractEntityHalifier {
  /**
   * @param {Object} app - provides app context
   * @param {Object} opts
   * @param {String} opts.baseUrl - entities base url, e.g. /people
   * @param {String} [opts.name] - entity name
   */
  constructor (app, opts) {
    Object.assign(this, {app, opts})
  }

  getId (entity) {
    return this.opts.idFieldName ? entity[this.opts.idFieldName] : entity.id
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

  getLinksForSingle (entity) {
    return {
      self: {
        href: this.opts.baseUrl + '/' + this.getId(entity),
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
      list.map(entity => this.halifyListItem(entity))
    )
      .then(embeddedArray => ({
        [this.getListName()]: embeddedArray
      }))
  }

  /**
   * @return {Promise}
   */
  halifyListItem (entity) {
    return this.halifySingle(entity)
  }

  /**
   * @return {Promise}
   */
  halifySingle (entity) {
    if (entity.toHal) {
      return Promise.resolve(entity.toHal())
    }
    return Promise.resolve(Object.assign(
      {_links: this.getLinksForSingle(entity)},
      entity
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

module.exports = AbstractEntityHalifier
