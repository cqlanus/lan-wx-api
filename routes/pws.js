const express = require('express')
const pws = require('../services/pws')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const devices = await pws.getDevices()
        res.json(devices)
    } catch (err) {
        console.error(err)
        const { message } = err
        res.status(500).json({ message })
    }
})

router.post('/', async (req, res) => {
    try {
        const created = await pws.addDevice(req.body)
        res.json(created)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
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
        res.status(500).json({ message })
    }
})

router.get('/info/:macAddress', async (req, res) => {
    try {
        const { apiKey } = req.query
        const { macAddress } = req.params
        const data = await pws.getDeviceInfo(macAddress, apiKey)
        res.json(data)
    } catch (err) {
        console.error(err)
        const { message } = err
        res.status(500).json({ message })
    }
})

module.exports = router
