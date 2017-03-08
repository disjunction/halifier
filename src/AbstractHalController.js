class AbstractHalController {
  constructor (app, opts) {
    this.app = app
    this.opts = Object.assign({
      itemHalifier: this,
      dataProvider: this,
      baseUrl: '/'
    }, opts)
  }

  validateDataProviderMethods (methodNames) {
    if (!this.opts.dataProvider) {
      throw new Error('missing dataProvider')
    }

    methodNames.forEach(methodName => {
      if (this.opts.dataProvider === this && !this.opts.dataProvider[methodName]) {
        throw new Error(`controller is used as dataProvider, but has no ${methodName} implementation`)
      }
      if (!this.opts.dataProvider[methodName]) {
        throw new Error(`missing ${methodName} implementation in dataProvider`)
      }
    })
  }

  validateItemHalifierMethods (methodNames) {
    if (!this.opts.itemHalifier) {
      throw new Error('missing itemHalifier')
    }

    methodNames.forEach(methodName => {
      if (this.opts.itemHalifier === this && !this.opts.itemHalifier[methodName]) {
        throw new Error(`controller is used as itemHalifier, but has no ${methodName} implementation`)
      }
      if (!this.opts.itemHalifier[methodName]) {
        throw new Error(`missing ${methodName} implementation in itemHalifier`)
      }
    })
  }

  /**
   * registers routes in a given router or directly in this.app
   * if no router is provided
   * @param {express.Router} [router]
   */
  useRoutes (router) {
    router = router || this.app
    router.get(this.opts.baseUrl, this.getListAction.bind(this))
    router.get(this.opts.baseUrl + '/:id', this.getItemAction.bind(this))

    if (this.postAction) {
      router.post(this.opts.baseUrl, this.postAction.bind(this))
    }

    if (this.deleteItemAction) {
      router.delete(this.opts.baseUrl + '/:id', this.deleteItemAction.bind(this))
    }
  }

  getItemAction (req, res, next) {
    this.validateDataProviderMethods(['findById'])
    return this.opts.dataProvider.findById(req.params.id)
      .then(item => this.opts.itemHalifier.halifyItem(item))
      .then(result => res.json(result))
      .catch(next)
  }

  getListAction (req, res, next) {
    this.validateDataProviderMethods(['runListQuery'])
    this.validateItemHalifierMethods(['makeProtoFromReq', 'halifyList'])
    const reponseProto = this.opts.itemHalifier.makeProtoFromReq(req)
    this.opts.dataProvider.runListQuery(reponseProto._listMeta)
      .then(([result, newListMeta]) => {
        reponseProto._listMeta = newListMeta
        return this.opts.itemHalifier.halifyList(result, reponseProto)
      })
      .then(result => res.json(result))
      .catch(next)
  }
}

module.exports = AbstractHalController
