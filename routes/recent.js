const express = require('express')
const location = require('../services/location')
const nws = require('../services/nws')
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
        const { limit } = req.query
        const data = await nws.getRecentConditions({ lat, lon }, limit)
        res.json(data)
    } catch (err) {
        console.error(err)
        const { message } = err
        res.status(404).json({ message })
    }
})

module.exports = router
