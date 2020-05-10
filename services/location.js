const request = require('../utils/request')
const qs = require('querystring')

const BASE = 'https://nominatim.openstreetmap.org'

class Location {

  queries = {}

  async geocode(address) {
    const query = qs.encode(address)
    const existingQuery = this.queries[query]
    if (existingQuery) {
      return existingQuery
    }
    const url = `${BASE}/search?${query}&format=json`
    const results = await request(url)
    const [ firstResult ] = results
    if (firstResult) {
      this.queries[query] = firstResult
      return firstResult;
    }
    throw new Error('unable to geocode address')
  }

  async reverseGeocode({ lat, lon }) {
    const query = qs.encode({ lat, lon })
    const url = `${BASE}/reverse?${query}&format-json`
    const results = await request(url)
    return results;
  }
}

const location = new Location()

module.exports = location
