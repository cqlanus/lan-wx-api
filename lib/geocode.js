const location = require('../services/location')

const geocodeMiddleware = async (req, res, next) => {
  const { zip } = req.params
  const query = { postalcode: zip }
  const { lat, lon } = await location.geocode(query)

  req.coords = { lat, lon }
  next()
}

module.exports = geocodeMiddleware
