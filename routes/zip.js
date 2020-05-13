const express = require('express')
const moment = require('moment')
const nws = require('../services/nws')
const location = require('../services/location')
const ncei = require('../services/ncei')
const noaa = require('../services/noaa')
const astro = require('../services/astronomy')
const geocodeMiddleware = require('../lib/geocode')
const router = express.Router()

const normalsDailyDatatypes = require('../lib/data/normals-daily-datatypes.json')
const dailySummaryDatatypes = require('../lib/data/daily-summaries-datatypes.json')

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
    const { tag } = req.query
    let types = tag.includes('all')
      ? []
      : tag.split(',').reduce((acc, t) => {
            const tags = normalsDailyDatatypes.tags[t] || []
            return [ ...acc, ...tags ]
          }, [])
    const data = await ncei.getNormals(req.coords, types.map(t => t.id))
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/dailysummary', geocodeMiddleware, async (req, res) => {
  try {
    const { tag, start, end } = req.query
    let types = tag.includes('all')
      ? []
      : tag.split(',').reduce((acc, t) => {
            const tags = dailySummaryDatatypes.tags[t] || []
            return [ ...acc, ...tags ]
          }, [])
    const data = await ncei.getDailySummaries(req.coords, types.map(t => t.id), start, end)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/sounding/:date/:timeOfDay', geocodeMiddleware, async (req, res) => {
  try {
    const { timeOfDay = 'morning', date } = req.params
    const data = await noaa.getSounding(req.coords, timeOfDay, date)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/climatereport', geocodeMiddleware, async (req, res) => {
  try {
    const data = await nws.getClimateReport(req.coords)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/astronomy/times/:date/:type', geocodeMiddleware, async (req, res) => {
  try {
    const { date, type } = req.params
    const dateParam = date ? moment(date) : moment()
    const data = await astro.getTimes(req.coords, dateParam, type)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/astronomy/position/:date/:type', geocodeMiddleware, async (req, res) => {
  try {
    const { date, type } = req.params
    const dateParam = date ? moment(date) : moment()
    const data = await astro.getPositions(req.coords, dateParam, type)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:zip/astronomy/moonphase/:date', async (req, res) => {
  try {
    const { date } = req.params
    const dateParam = date ? moment(date) : moment()
    const data = await astro.getMoonPhase(dateParam)
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

module.exports = router
