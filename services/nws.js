const request = require('../utils/request')
const parseClimateReport = require('../lib/parseClimateReport')

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
    try {
      const coords = `${lat}|${lon}`
      const data = await this.getData('points', coords, async () => {
        const url = `${BASE}/points/${lat},${lon}`
        const { properties } = await nwsRequest(url)
        return properties;
      })
      return data
    } catch (err) {
      throw new Error(`NWS - GET POINTS ERROR: ${err.message}`)
    }
  }

  getNearbyStations = async (url) => await this.getData('stations', url, async () => await nwsRequest(url))

  getNearestStation = async (url, retry = false) => {
    try {
      const { observationStations } = await this.getNearbyStations(url)
      const [firstStationUrl, secondStationUrl] = observationStations
      const stationUrl = retry ? secondStationUrl : firstStationUrl
      const data = await this.getData('nearbyStation', stationUrl, async () => {
        const { properties } = await nwsRequest(stationUrl)
        return properties
      })
      return data

    } catch (err) {
      throw new Error(`NWS - GET STATION ERROR: ${err.message}`)

    }
  }

  getSevenDayForecast = async ({ lat, lon }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { forecast } = points
      const { properties } = await nwsRequest(forecast)
      return properties
    } catch (err) {
      throw new Error(`NWS - GET FORECAST ERROR: ${err.message}`)
    }
  }

  getGriddedForecast = async ({ lat, lon }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { forecastGridData } = points
      const { properties } = await nwsRequest(forecastGridData)
      return properties
    } catch (err) {
      throw new Error(`NWS - GET FORECAST GRID ERROR: ${err.message}`)
    }
  }

  getHourlyForecast = async ({ lat, lon }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { forecastHourly } = points
      const { properties } = await nwsRequest(forecastHourly)
      return properties
    } catch (err) {
      throw new Error(`NWS - GET FORECAST HOURLY ERROR: ${err.message}`)
    }
  }

  getConditions = async ({ lat, lon }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const station = await this.getNearestStation(stationsUrl)
      const url = `${station['@id']}/observations/latest`
      const { properties } = await nwsRequest(url)
      return properties
    } catch (err) {
      throw new Error(`NWS - GET CONDITIONS ERROR: ${err.message}`)
    }
  }

  getForecastOffice = async ({ lat, lon }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const { stationIdentifier, county: countyUrl } = await this.getNearestStation(stationsUrl)
      const data = await this.getData('forecastOffice', stationIdentifier, async () => {
        const { properties } = await nwsRequest(countyUrl)
        return properties
      })
      return data
    } catch (err) {
      throw new Error(`NWS - GET FORECAST OFFICE ERROR: ${err.message}`)
    }
  }

  getForecastDiscussion = async ({ lat, lon }) => {
    try {
      const FORECAST_DISCUSSION_CODE = 'AFD'
      const forecastOffice = await this.getForecastOffice({ lat, lon })
      const { cwa } = forecastOffice
      const url = `${BASE}/products/types/${FORECAST_DISCUSSION_CODE}/locations/${cwa}`
      const discussionList = await nwsRequest(url)
      const [firstItem] = discussionList['@graph']
      const discussionUrl = firstItem['@id']
      const discussion = await nwsRequest(discussionUrl)
      return processDiscussion(discussion)
    } catch (err) {
      throw new Error(`NWS - GET FORECAST DISCUSSION ERROR: ${err.message}`)
    }
  }

  getClimateReport = async ({ lat, lon }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const station = await this.getNearestStation(stationsUrl)
      const { stationIdentifier } = station
      const url = `https://api.weather.gov/products/types/CLI/locations/${stationIdentifier.slice(1)}`
      const listOfReports = await nwsRequest(url)
      const [latestReportUrl] = listOfReports['@graph']
      const resp = await nwsRequest(latestReportUrl['@id'])
      const { productText } = resp
      const climateReport = parseClimateReport(productText)
      return climateReport
    } catch (err) {
      throw new Error(`NWS - GET CLIMATE REPORT ERROR: ${err.message}`)
    }
  }
}

const processDiscussion = ({ productText }) => {
  const titlePattern = /(\n\..*\.{3})/
  const [meta, ...content] = productText.split(titlePattern)
  return content.reduce((acc, curr, idx, arr) => {
    if (titlePattern.test(curr)) {
      const [title, content] = arr.slice(idx, idx + 2)
      const updatedTitle = title.replace('\n', '').replace(/\.*/g, '')
      const updatedContent = content.split('\n').map(s => s.trim())
      const indexes = updatedContent.reduce((acc, curr, idx) => {
        if (curr === "") {
          return [...acc, idx]
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
