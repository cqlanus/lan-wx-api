const request = require('../utils/request')
const nws = require('./nws')
const Station = require('../db/models/station')

const BASE = 'https://www.ncei.noaa.gov/access/services/data/v1'

const nceiRequest = async ({ dataset, dataTypes, stations, startDate, endDate }) => {
  const url = `${BASE}?dataset=${dataset}&dataTypes=${dataTypes}&startDate=${startDate}&endDate=${endDate}&stations=${stations}&format=json`
  console.log({ url })
  return await request(url)
}

class NCEI {

  getNormals = async (coords, datatypes = ['DLY-GRDD-BASE45', 'DLY-TAVG-NORMAL'], retry = false) => {
    try {
      const wban = await this.getAssociatedStationId(coords, retry)
      console.log({ wban })
      const query = {
        dataset: 'normals-daily',
        dataTypes: datatypes.join(),
        stations: `USW000${wban}`,
        startDate: '2010-01-01',
        endDate: '2010-12-31',
      }
      const norms = await nceiRequest(query)
      if (norms.length === 0) {
        return this.getNormals(coords, datatypes, true)
      }
      return norms
    } catch (err) {
      throw new Error(`NCEI - GET NORMALS ERROR: ${err.message}`)
    }
  }

  getDailySummaries = async (coords, datatypes = [], start = '2020-05-01', end = '2020-04-01', retry = false) => {
    try {
      const wban = await this.getAssociatedStationId(coords, retry)
      const query = {
        dataset: 'daily-summaries',
        dataTypes: datatypes.join(),
        stations: `USW000${wban}`,
        startDate: start,
        endDate: end,
      }
      const norms = await nceiRequest(query)
      if (norms.length === 0) {
        return this.getDailySummaries(coords, datatypes, start, end, true)
      }
      return norms
    } catch (err) {
      throw new Error(`NCEI - GET DAILY SUMMARIES ERROR: ${err.message}`)
    }
  }

  getAssociatedStationId = async ({ lat, lon }, retry = false) => {
    try {
      const points = await nws.getPoints({ lat, lon })
      const { observationStations: stationsUrl } = points
      const station = await nws.getNearestStation(stationsUrl, retry)
      const stationRecord = await Station.findOne({
        where: {
          icao: station.stationIdentifier
        }
      })
      // console.log({ found: { wban: stationRecord.wban, name: stationRecord.station_name_current, city: stationRecord.city } })
      return stationRecord.wban
    } catch (err) {
      throw new Error(`MLID - GET ASSOCIATED STATION ERROR: ${err.message}`)
    }
  }
}

const ncei = new NCEI()

module.exports = ncei
