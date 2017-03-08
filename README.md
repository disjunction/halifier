# halifier

A helper toolset for building HAL API with express

Features:

* converts JS objects and arrays of objects to HAL responses
* adds extra conventional field `_listMeta` when returning arrays of objects
* provides simple implementation for a controller providing HAL interface to a collection

This is a basis for further concrete implementations such as:
* [halifier-sequelize](https://www.npmjs.com/package/halifier-sequelize)
* halifier-mongoose

## Usage examples

### pure AbstractItemHalifier

```javascript
const {AbstractItemHalifier} = require('halifier')
const data = [
  {pass: 'ZK872343', name: 'John', eyeColor: 'blue', weight: 70},
  {pass: 'ANK34323', name: 'Marry', eyeColor: 'brown', weight: 65},
  {pass: 'LP109929', name: 'T1000', eyeColor: 'red', weight: 128}
]

const app = require('express')()

const peopleHalifier = new AbstractItemHalifier(app, {
  idFieldName: 'pass',
  baseUrl: '/humans',
  name: 'human',
  listMeta: {
    limit: 2 // number of returned objects in one response
  }
})

app.get('/humans/:pass', (req, res) => {
  const found = data.filter(human => human.pass === req.params.pass)
  if (found.length) {
    peopleHalifier.halifyItem(found[0])
      .then(result => res.json(result))
  } else {
    res.sendStatus(404)
  }
})

app.get('/humans', (req, res) => {
  // make a prototype of the response
  const responseProto = peopleHalifier.makeProtoFromReq(req)

  // provide actual list metadata
  responseProto._listMeta.stats = {
    total: data.length,
    // we want to return only first 2 records,
    // the other ones should be accessible via pagination
    returned: 2
  }
  peopleHalifier.halifyList(data.slice(2), responseProto)
    .then(result => res.json(result))
})

app.listen(3000)
```
