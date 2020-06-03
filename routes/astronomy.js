const express = require('express')
const moment = require('moment')
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

router.get('/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params
    const dateParam = moment()
    const type = 'all'
    const times = await astro.getTimes({ lat, lon }, dateParam, type)
    const position = await astro.getPositions({ lat, lon }, dateParam, type)
    const moonphase = await astro.getMoonPhase(dateParam)

    const dateTom = moment().add(1, 'day')
    const tomTimes = await astro.getTimes({ lat, lon }, dateTom, type)
    const tomPosition = await astro.getPositions({ lat, lon }, dateTom, type)
    const tomMoonphase = await astro.getMoonPhase(dateTom)
    const tomorrow = { times: tomTimes, position: tomPosition, moonphase: tomMoonphase }

    const data = { times, position, moonphase, tomorrow }
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:lat/:lon/:date', async (req, res) => {
  try {
    const { lat, lon, date } = req.params
    const dateParam = moment(date)
    const type = 'all'
    const times = await astro.getTimes({ lat, lon }, dateParam, type)
    const position = await astro.getPositions({ lat, lon }, dateParam, type)
    const moonphase = await astro.getMoonPhase(dateParam)
    const data = { times, position, moonphase }
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

router.get('/:lat/:lon/:date/:type', async (req, res) => {
  try {
    const { lat, lon, date, type } = req.params
    const dateParam = moment(date)
    const times = await astro.getTimes({ lat, lon }, dateParam, type)
    const position = await astro.getPositions({ lat, lon }, dateParam, type)
    const moonphase = await astro.getMoonPhase(dateParam)
    const data = { times, position, moonphase }
    res.json(data)
  } catch (err) {
    console.error(err)
    const { message } = err
    res.status(404).json({ message })
  }
})

module.exports = router
