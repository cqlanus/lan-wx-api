const request = require('../utils/request')

const BASE = 'https://api.weather.gov/'
const HEADERS = {
  'User-Agent': 'cqlanus@gmail.com'
}

const nwsRequest = async (url, opts, sendJSON = true) => await request(url, { headers: HEADERS, ...opts }, sendJSON)

class NWS {

  points = {}
  stations = {}
  nearbyStation = {}
  latestConditions = {}
  forecast = {}

  async getData(cacheType, cacheKey, cb) {
    const existing = this[cacheType][cacheKey]
    if (existing) {
      return existing
    }
    const data = await cb()
    this[cacheType][cacheKey] = data
    return data
  }

  getPoints = async ({ lat, lon }) => {
    const coords = `${lat}|${lon}`
    const data = await this.getData('points', coords, async () => {
      const url = `${BASE}/points/${lat},${lon}`
      const { properties } = await nwsRequest(url)
      return properties;
    })
    return data
  }

  getNearbyStations = async (url) => await this.getData('stations', url, async () => await nwsRequest(url))

  getNearestStation = async (url) => {
      const { observationStations } = await this.getNearbyStations(url)
      const [ firstStationUrl ] = observationStations
    const data = await this.getData('nearbyStation', firstStationUrl, async () => {
      const { properties } = await nwsRequest(firstStationUrl)
      return properties
    })
    return data
  }

  getSevenDayForecast = async ({ lat, lon }) => {
    const points = await this.getPoints({ lat, lon })
    const { forecast } = points
    const { properties } = await nwsRequest(forecast)
    return properties
  }

  getConditions = async ({ lat, lon }) => {
    const points = await this.getPoints({ lat, lon })
    const { observationStations: stationsUrl } = points
    const station = await this.getNearestStation(stationsUrl)
    const url = `${station['@id']}/observations/latest`
    const { properties } = await nwsRequest(url)
    return properties
  }
}

const nws = new NWS()

module.exports = nws
