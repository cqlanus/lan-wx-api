const request = require('../utils/request')
const nws = require('./nws')
const Station = require('../db/models/station')

const BASE = 'https://www.ncei.noaa.gov/access/services/data/v1'

const nceiRequest = async ({ dataset, dataTypes, stations, startDate, endDate }) => {
  const url = `${BASE}?dataset=${dataset}&dataTypes=${dataTypes}&startDate=${startDate}&endDate=${endDate}&stations=${stations}&format=json`
  return await request(url)
}

const DATATYPES_MAP = {
  d_tmax: 'DLY-TAVG-NORMAL'
}

class NCEI {

  getNormals = async (coords, datatypes = ['DLY-GRDD-BASE45','DLY-TAVG-NORMAL'], retry = false) => {
    const wban = await this.getAssociatedStationId(coords, retry)
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
  }

  getAssociatedStationId = async ({ lat, lon }, retry = false) => {
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
  }

}

const ncei = new NCEI()

module.exports = ncei
