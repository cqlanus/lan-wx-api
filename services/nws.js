const request = require('../utils/request')
const moment = require('moment')
const parseClimateReport = require('../lib/parseClimateReport')
const { redisGet, redisSet } = require('../lib/redis')
const latLonKey = require('../utils/latLonKey')

const BASE = 'https://api.weather.gov/'
const HEADERS = {
  'User-Agent': 'cqlanus@gmail.com'
}

const nwsRequest = async (url, opts, sendJSON = true) => await request(url, { headers: HEADERS, ...opts }, sendJSON)

class NWS {

  async getData(cacheType, cacheKey, cb) {
    const key = `${cacheType}|${cacheKey}`
    const cached = await redisGet(key)
    if (cached) {
      return JSON.parse(cached)
    }

    const data = await cb()
    await redisSet(key, JSON.stringify(data))
    return data
  }

  getPoints = async ({ lat, lon }) => {
    try {
      const coords = latLonKey({ lat, lon })
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

  getStation = async (icao) => {
    try {
      const data = this.getData('stations', icao, async () => {
        const url = `${BASE}/stations/${icao.toUpperCase()}`
        const { properties } = await nwsRequest(url)
        return properties
      })
      return data
    } catch (err) {
      throw new Error(`NWS - GET STATION BY ID ERROR: ${err.message}`)
    }
  }

  getSevenDayForecast = async ({ lat, lon }) => {
    const key = `sevenday|${latLonKey({ lat, lon })}`
    try {
      const points = await this.getPoints({ lat, lon })
      const { forecast } = points
      const { properties } = await nwsRequest(forecast)
      await redisSet(key, JSON.stringify(properties))
      return properties
    } catch (err) {
      const cached = await redisGet(key)
      if (cached) {
        console.log({ err })
        return JSON.parse(cached)
      }
      throw new Error(`NWS - GET FORECAST ERROR: ${err.message}`)
    }
  }

  getGriddedForecast = async ({ lat, lon }, { shouldParse }) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { forecastGridData } = points
      const resp = await nwsRequest(forecastGridData)
      if (shouldParse) {
        const parsed = parseGriddedForecastByDay(resp.properties)
        return parsed
      }
      return resp.properties
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
    const key = `conditions|${latLonKey({ lat, lon })}`
    try {
      const points = await this.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const station = await this.getNearestStation(stationsUrl)
      const originalUrl = `${station['@id']}/observations/latest`
      const url = `${station['@id']}/observations`
      const { features } = await nwsRequest(url)
      if (features[0]) {
        const { properties } = features[0]
        const data = { ...properties, station }
        await redisSet(key, JSON.stringify(data))
        return data
      } else {
        const { properties } = await nwsRequest(originalUrl)
        const data = { ...properties, station }
        await redisSet(key, JSON.stringify(data))
        return data
      }
    } catch (err) {
      const cached = await redisGet(key)
      if (cached) {
        console.log({ err })
        return JSON.parse(cached)
      }
      throw new Error(`NWS - GET CONDITIONS ERROR: ${err.message}`)
    }
  }

  getRecentConditions = async ({ lat, lon }, limit = undefined) => {
    try {
      const points = await this.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const station = await this.getNearestStation(stationsUrl)
      const url = `${station['@id']}/observations`
      const { features } = await nwsRequest(url)
      return +limit ? features.slice(0, +limit) : features
    } catch (err) {
      throw new Error(`NWS - GET RECENT CONDITIONS ERROR: ${err.message}`)
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

  getAlerts = async(zoneId) => {
    try {
      const url = `https://api.weather.gov/alerts/active/zone/${zoneId.toUpperCase()}`
      const resp = await nwsRequest(url)
      return resp.features
    } catch (err) {
      throw new Error(`NWS - GET ALERTS ERR: ${err.message}`)
    }
  }
}

const gridKeys = ['temperature', 'dewpoint', 'maxTemperature', 'minTemperature', 'relativeHumidity', 'apparentTemperature', 'heatIndex', 'windChill', 'skyCover',
  'windDirection', 'windSpeed', 'windGust', 'weather', 'probabilityOfPrecipitation', 'quantitativePrecipitation', 'snowfallAmount', 'ceilingHeight',
  'visibility', 'transportWindSpeed', 'transportWindDirection', 'mixingHeight', 'lightningActivityLevel', 'pressure', 'davisStabilityIndex', 'atmosphericDispersionIndex',
  'stability', 'probabilityOfThunder']
const parseGriddedForecastByDay = (grid) => {
  return gridKeys.reduce((parsed, key) => {
    const val = grid[key] || []
    const { sourceUnit, uom: unitCode, values } = val
    const fullValues = values.map(v => ({ ...v, unitCode, sourceUnit }))
    fullValues.forEach((v, idx) => {
      const { validTime } = v
      const [ts, interval] = validTime.split('/')
      const duration = moment.duration(interval).hours()
      const mom = moment(ts)
      const increasingTime = Array.from({ length: duration }, (_, idx) => mom.clone().add(idx, 'hours').toISOString())
      if (idx === 2 && key === 'dewpoint') {
        console.log({ key, increasingTime })
      }
      increasingTime.forEach(time => {
        const existing = parsed[time]
        parsed = {
          ...parsed,
          [time]: {
            ...existing,
            time,
            [key]: v

          }
        }
      })
    })
    return parsed
  }, {})
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
      let paragraphs = indexes.reduce((acc, curr, idx) => {
        const part = updatedContent.slice(curr, indexes[idx + 1])
        return [...acc, part.join(' ')]
      }, [])
      const endTokenIndex = paragraphs.findIndex(p => p === '$$')
      if (endTokenIndex > -1) {
        paragraphs = paragraphs.slice(0, endTokenIndex)
      }
      return { ...acc, [updatedTitle]: paragraphs }
    }
    return acc
  }, { meta: meta.split('\n').filter(Boolean) })
}

const nws = new NWS()

module.exports = nws
