const express = require('express')
const nws = require('../services/nws')
const station = require('../services/station')
const router = express.Router()
const { redisGet, redisSet } = require('../lib/redis')

router.get('/:icao', async (req, res) => {
    try {
        const { icao } = req.params
        const cached = await redisGet(icao)
        if (cached) {
            res.json(JSON.parse(cached))
        } else {
            const found = await station.get(icao.toUpperCase())
            await redisSet(icao, JSON.stringify(found))
            res.json(found)
        }
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

router.get('/nws/:icao', async (req, res) => {
    try {
        const { icao } = req.params
        const cacheKey = `nws|${icao}`
        const cached = await redisGet(cacheKey)
        if (cached) {
            res.json(JSON.parse(cached))
        } else {
            const found = await nws.getStation(icao)
            await redisSet(cacheKey, JSON.stringify(found))
            res.json(found)
        }
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

module.exports = router
