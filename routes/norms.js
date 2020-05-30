const express = require('express')
const location = require('../services/location')
const ncei = require('../services/ncei')
const router = express.Router()

const normalsDailyDatatypes = require('../lib/data/normals-daily-datatypes.json')

router.get('/', async (req, res) => {
  try {
    const query = {
      postalcode: '90023'
    }
    const { lat, lon } = await location.geocode(query)
    res.json({ lat, lon })
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params
    const { tag = 'all' } = req.query
    let types = tag.includes('all')
      ? []
      : tag.split(',').reduce((acc, t) => {
            const tags = normalsDailyDatatypes.tags[t] || []
            return [ ...acc, ...tags ]
          }, [])
    const data = await ncei.getNormals({ lat, lon }, types.map(t => t.id))
    res.json({ data, types })
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

module.exports = router
