const express = require('express')
const location = require('../services/location')
const pws = require('../services/pws')
const router = express.Router()

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

router.get('/:macAddress', async (req, res) => {
  try {
      const { apiKey } = req.query
      const { macAddress } = req.params
      const data = await pws.getData(macAddress, apiKey)
      res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

module.exports = router
