/* eslint-env jasmine */
const ArrayDataProvider = require('../src/ArrayDataProvider')
const meta = require('../src/meta')

describe('ArrayDataProvider', () => {
  describe('runListQuery()', () => {
    const testArray = [
      {a: 6},
      {a: 7},
      {a: 8, b: '5'},
      {a: 1, b: '9'},
      {a: 2, b: '9'},
      {a: 3, c: 'apple'},
      {a: 4, c: 'kiwi'},
      {a: 5, c: 'banana'}
    ]
    const testProvider = new ArrayDataProvider(testArray)

    it('returns full array for an empty listMeta', done => {
      const listMeta = meta.makeListMeta()
      testProvider.runListQuery(listMeta)
        .then(([selected, newListMeta]) => {
          expect(selected.length).toBe(8)
          expect(newListMeta.stats.total).toBe(8)
          expect(newListMeta.stats.returned).toBe(8)
          done()
        })
        .catch(done.fail)
    })

    xit('applies order and slices according to paging', done => {
      const listMeta = meta.makeListMeta(null, {
        limit: 3,
        offset: 1,
        order: 'a'
      })
      testProvider.runListQuery(listMeta)
        .then(([selected, newListMeta]) => {
          expect(selected.length).toBe(3)
          expect(newListMeta.stats.total).toBe(8)
          expect(newListMeta.stats.returned).toBe(3)
          expect(selected[0].a).toBe(2)
          expect(selected[1].a).toBe(3)
          expect(selected[2].a).toBe(4)
          done()
        })
        .catch(done.fail)
    })

    it('applies query', done => {
      const listMeta = meta.makeListMeta({b: '9'})
      testProvider.runListQuery(listMeta)
        .then(([selected, newListMeta]) => {
          expect(selected.length).toBe(2)
          expect(selected[0].a).toBe(1)
          expect(selected[1].a).toBe(2)
          done()
        })
        .catch(done.fail)
    })
  })
})
