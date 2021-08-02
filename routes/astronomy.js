const express = require('express')
const location = require('../services/location')
const astro = require('../services/astronomy')
const air = require('../services/air')

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
  current: astro.getCurrentConditions,
}

const AIR_METHODS = {
  current: air.getCurrent,
  station: air.getStation,
}

const INTERVAL_METHODS = {
  daylengths: astro.getTimesForInterval,
  positions: astro.getPositionsForInterval
}

router.get('/interval/:type', async (req, res) => {
  try {
    const { type } = req.params
    const { lat, lon, start, end } = req.query
    const func = INTERVAL_METHODS[type]
    if (!func) { throw new Error(`No resource type: ${type}`) }
    const data = await func(new Date(start), new Date(end), lat, lon)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(500).json({ message })
  }
})

router.get('/air/:type', async (req, res) => {
  try {
    const { type } = req.params
    const { lat, lon, hours } = req.query
    const func = AIR_METHODS[type]
    if (!func) { throw new Error(`No resource type: ${type}`) }
    const data = await func(lat, lon, hours)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(500).json({ message })
  }
})

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
