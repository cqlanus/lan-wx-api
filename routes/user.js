const express = require('express')
const user = require('../services/user')
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username } = req.body
        const created = await user.create(username)
        res.json(created)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

router.use('/:username', async (req, res, next) => {
    const { username } = req.params
    const found = await user.getUser(username)
    if (found) {
        req.userId = found.id
        res.user = found
    }
    next()
})

router.get('/:username', async (req, res) => {
    try {
        if (res.user) {
            res.json(res.user)
        } else {
            res.json(false)
        }
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

router.get('/:username/favorites', async (req, res) => {
    try {
        const { userId } = req
        const stations = await user.getFavoriteStations(userId)
        res.json(stations)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

router.post('/:username/favorites', async (req, res) => {
    try {
        const query = { userId: req.userId, stationId: req.body.stationId }
        const created = await user.setFavoriteStation(query)
        res.json(created)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})


router.delete('/:username/favorites', async (req, res) => {
    try {
        const { id } = req.body
        const resp = await user.removeFavoriteStation(id)
        res.json(resp)
    } catch (err) {
        console.log({ err })
        const { message } = err
        res.status(500).json({ message })
    }
})

module.exports = router
