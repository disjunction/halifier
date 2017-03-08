/* eslint-env jasmine */
const meta = require('../src/meta')

describe('meta', () => {
  describe('makeListMeta()', () => {
    it('reads values from query', () => {
      const req = {query: {apple: 17}}
      const opts = {listMeta: {limit: 50}}
      const listMeta = meta.makeListMeta(req.query, opts)
      expect(listMeta.query.apple).toBe(17)
    })
    it('sets default values', () => {
      const opts = {listMeta: {limit: 50}}
      const listMeta = meta.makeListMeta(null, opts)
      expect(listMeta.limit).toBe(50)
      expect(listMeta.offset).toBe(0)
    })
  })
  describe('extrasFromHyphened()', () => {
    it('reads limit', () => {
      const query = meta.extrasFromHyphened({
        '-s': 10,
        '-l': 5
      })
      expect(query.limit).toBe(5)
    })

    it('limit can be undefined', () => {
      const query = meta.extrasFromHyphened({
        '-s': 10
      })
      expect(query.limit).not.toBeDefined()
    })
  })
})
