const location = require('../services/location')
const { redisGet, redisSet } = require('./redis')

const geocodeMiddleware = async (req, res, next) => {
  const { zip } = req.params
  const query = { postalcode: zip }
  const key = `geocode|${zip}`
  const cached = await redisGet(key)
  if (cached) {
    req.coords = JSON.parse(cached)
    next()
  } else {
    const { lat, lon } = await location.geocode(query)
    req.coords = { lat, lon }
    await redisSet(key, JSON.stringify({lat, lon}))
    next()
  }
}

module.exports = geocodeMiddleware
