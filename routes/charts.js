const express = require('express')
const location = require('../services/location')
const noaa = require('../services/noaa')
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

router.get('/upperair/:isobar/:timeOfDay', async (req, res) => {
  try {
    const { isobar, timeOfDay } = req.params
    const image = await noaa.getUpperAirMap(isobar, timeOfDay)
    res.json(image)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/sounding/:lat/:lon/:timeOfDay', async (req, res) => {
  try {
    const { date, lat, lon, timeOfDay } = req.params
    const image = await noaa.getSounding({ lat, lon }, timeOfDay, date)
    res.json(image)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/surface/:timeOfDay', async (req, res) => {
  try {
    const { timeOfDay } = req.params
    const { fronts } = req.query
    const image = await noaa.getSurfaceAnalysis(timeOfDay, fronts)
    res.json(image)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

module.exports = router
