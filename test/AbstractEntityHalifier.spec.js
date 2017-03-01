/* eslint-env jasmine */
const Halifier = require('../src/AbstractEntityHalifier')

describe('AbstractEntityHalifier', () => {
  it('creates self link by default', done => {
    const halifier = new Halifier({}, {name: 'human', baseUrl: '/people'})
    halifier.halifySingle({id: 'AB543', firstName: 'John'})
      .then(result => {
        expect(result._links).toBeDefined()
        expect(result._links.self).toEqual({href: '/people/AB543', title: 'get single human'})
        done()
      })
      .catch(done.fail)
  })

  describe('lists', () => {
    describe('makeNextPrevLinks()', () => {
      it('works with minimal empty setup', () => {
        const halifier = new Halifier({}, {name: 'human', baseUrl: '/people'})
        const proto = {_listMeta: {totalCount: 50, query: {}, offset: 0, limit: 20}}
        const links = halifier.makeNextPrevLinks([], proto)
        expect(links.next).toBeDefined()
        expect(links.prev).not.toBeDefined()
      })
      it('uses offset', () => {
        const halifier = new Halifier({}, {name: 'human', baseUrl: '/people'})
        const proto = {_listMeta: {totalCount: 50, query: {}, offset: 20, limit: 10}}
        const links = halifier.makeNextPrevLinks([], proto)
        expect(links.next).toBeDefined()
        expect(links.next.href).toBe('/people?limit=10&offset=30')
        expect(links.prev).toBeDefined()
      })
    })
  })
})
