const express = require('express')
const nws = require('../services/nws')
const router = express.Router()

router.get('/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params;
        const data = await nws.getAlerts(zoneId)
        res.json(data)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})


module.exports = router
