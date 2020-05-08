const request = require('../utils/request')

const BASE = 'https://api.weather.gov/'
const HEADERS = {
  'User-Agent': 'cqlanus@gmail.com'
}

const nwsRequest = async (url, opts) => await request(url, { headers: HEADERS, ...opts })

class NWS {

  points = {}
  stations = {}
  nearbyStation = {}
  latestConditions = {}

  async getData(cacheType, cacheKey, cb) {
    console.log({ cacheType, cacheKey })
    const existing = this[cacheType][cacheKey]
    console.log({ here: '?' })
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

  getConditions = async ({ lat, lon }) => {
    const coords = `${lat}|${lon}`
    const data = await this.getData('latestConditions', coords, async () => {
      const points = await this.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const station = await this.getNearestStation(stationsUrl)
      console.log({ station })
      const url = `${station['@id']}/observations/latest`
      const { properties } = await nwsRequest(url)
      return properties
    })
    return data
  }
}

const nws = new NWS()

module.exports = nws
