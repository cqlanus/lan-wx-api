const request = require('../utils/request')

const BASE = 'https://api.weather.gov/'
const HEADERS = {
  'User-Agent': 'cqlanus@gmail.com'
}

const nwsRequest = async (url, opts, sendJSON = true) => await request(url, { headers: HEADERS, ...opts }, sendJSON)


// TODO:
// 1. get forecast area discussion by way of forecast office: station -> county -> cwa
// 2. create new service for norms/almanac/astronomy

class NWS {

  points = {}
  stations = {}
  nearbyStation = {}
  latestConditions = {}
  forecast = {}
  forecastOffice = {}

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

  getNearestStation = async (url, retry = false) => {
    const { observationStations } = await this.getNearbyStations(url)
    const [ firstStationUrl, secondStationUrl ] = observationStations
    const stationUrl = retry ? secondStationUrl : firstStationUrl
    const data = await this.getData('nearbyStation', stationUrl, async () => {
      const { properties } = await nwsRequest(stationUrl)
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

  getGriddedForecast = async ({ lat, lon }) => {
    const points = await this.getPoints({ lat, lon })
    const { forecastGridData } = points
    const { properties } = await nwsRequest(forecastGridData)
    return properties
  }

  getHourlyForecast = async ({ lat, lon }) => {
    const points = await this.getPoints({ lat, lon })
    const { forecastHourly } = points
    const { properties } = await nwsRequest(forecastHourly)
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

  getForecastOffice = async ({ lat, lon }) => {
    const points = await this.getPoints({ lat, lon })
    console.log({ points })
    const { observationStations: stationsUrl } = points
    const { stationIdentifier, county: countyUrl } = await this.getNearestStation(stationsUrl)
    const data = await this.getData('forecastOffice', stationIdentifier, async () => {
      const { properties } = await nwsRequest(countyUrl)
      return properties
    })
    return data
  }

  getForecastDiscussion = async ({ lat, lon }) => {
    const FORECAST_DISCUSSION_CODE = 'AFD'
    const forecastOffice = await this.getForecastOffice({ lat, lon })
    const { cwa  } = forecastOffice
    const url = `${BASE}/products/types/${FORECAST_DISCUSSION_CODE}/locations/${cwa}`
    const discussionList = await nwsRequest(url)
    const [ firstItem ] = discussionList['@graph']
    const discussionUrl = firstItem['@id']
    const discussion = await nwsRequest(discussionUrl)
    return processDiscussion(discussion)
  }
}

const processDiscussion = ({ productText }) => {
  const titlePattern = /(\n\..*\.{3})/
  const [ meta, ...content ] = productText.split(titlePattern)
  return content.reduce((acc, curr, idx, arr) => {
    if (titlePattern.test(curr)) {
      const [ title, content ] = arr.slice(idx, idx + 2)
      const updatedTitle = title.replace('\n', '').replace(/\.*/g, '')
      const updatedContent = content.split('\n').map(s => s.trim())
      const indexes = updatedContent.reduce((acc, curr, idx) => {
        if (curr === "") {
          return [ ...acc, idx ]
        }
        return acc
      }, [])
      const paragraphs = indexes.reduce((acc, curr, idx) => {
        const part = updatedContent.slice(curr, indexes[idx + 1])
        return [...acc, part.join('')]
      }, [])
      return { ...acc, [updatedTitle]: paragraphs }
    }
    return acc
  }, { meta: meta.split('\n').filter(Boolean) })
}

const nws = new NWS()

module.exports = nws
