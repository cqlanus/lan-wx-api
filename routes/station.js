const express = require('express')
const nws = require('../services/nws')
const station = require('../services/station')
const router = express.Router()

router.get('/:icao', async (req, res) => {
    try {
        const { icao } = req.params
        const found = await station.get(icao.toUpperCase())
        res.json(found)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

router.get('/nws/:icao', async (req, res) => {
    try {
        const { icao } = req.params
        const found = await nws.getStation(icao)
        res.json(found)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

module.exports = router
