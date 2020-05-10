const express = require('express')
const nws = require('../services/nws')
const location = require('../services/location')
const ncei = require('../services/ncei')
const geocodeMiddleware = require('../lib/geocode')
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

router.get('/:zip/forecast', geocodeMiddleware, async (req, res) => {
  try {
    const data = await nws.getSevenDayForecast(req.coords)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/forecast/grid', geocodeMiddleware, async (req, res) => {
  try {
    const data = await nws.getGriddedForecast(req.coords)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/forecast/hourly', geocodeMiddleware, async (req, res) => {
  try {
    const data = await nws.getHourlyForecast(req.coords)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/forecast/discussion', geocodeMiddleware, async (req, res) => {
  try {
    const data = await nws.getForecastDiscussion(req.coords)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/current', geocodeMiddleware, async (req, res) => {
  try {
    const data = await nws.getConditions(req.coords)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/norms', geocodeMiddleware, async (req, res) => {
  try {
    console.log({ query: req.query })
    const { datatypes } = req.query
    const data = await ncei.getNormals(req.coords, datatypes.split(','))
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

module.exports = router
