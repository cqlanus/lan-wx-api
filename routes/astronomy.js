const express = require('express')
const location = require('../services/location')
const astro = require('../services/astronomy')

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

const ASTRO_METHODS = {
  summary: astro.getSummaryReport,
  sun: astro.getSunSummary,
  moon: astro.getMoonSummary,
  times: astro.getAllTimes,
  moonphase: astro.getMoonPhases,
  positions: astro.getAllPositions,
}

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params
    const { lat, lon, date } = req.query
    const dateObj = date ? new Date(date) : new Date()
    const func = ASTRO_METHODS[type]
    if (!func) { throw new Error(`No resource type: ${type}`) }
    const data = await func(dateObj, lat, lon)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(500).json({ message })
  }
})

module.exports = router
