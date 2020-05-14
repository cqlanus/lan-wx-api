const moment = require('moment')
const soundingStations = require('../lib/data/sounding-stations.json')

const BASE = 'https://www.spc.noaa.gov'

function Deg2Rad(deg) {
  return Number(deg) * Math.PI / 180;
}

const PythagorasEquirectangular = ({ lat, lon }) => (_lat, _lon) => {
  const lat1 = Deg2Rad(lat)
  const lat2 = Deg2Rad(_lat)
  const lon1 = Deg2Rad(lon)
  const lon2 = Deg2Rad(_lon)
  const R = 6371 // km
  const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2)
  const y = (lat2 - lat1)
  const d = Math.sqrt(x * x + y * y) * R
  return d
}

const getNearestStation = coords => list => {
  const getDistanceFrom = PythagorasEquirectangular(coords)
  let nearestDistance;
  return list.reduce((nearestSt, station) => {
    const { lat_prp, lon_prp } = station
    const distance = getDistanceFrom(lat_prp, lon_prp)
    if (!nearestDistance || (distance < nearestDistance)) {
      nearestDistance = distance
      return station
    } else {
      return nearestSt
    }
  })
}

class NOAA {
  getUpperAirMap = async (isobar, timeOfDay) => {
    try {
      const utcTime = timeOfDay === 'morning' ? '12' : '00'
      const url = `${BASE}/obswx/maps/${isobar}_${utcTime}.gif`
      return url
    } catch (err) {
      throw new Error(`NOAA - GET UPPER AIR MAP ERROR: ${err.message}`)
    }
  }

  getSounding = async (coords, timeOfDay, date) => {
    try {
      const utcTime = timeOfDay === 'morning' ? '12' : '00'
      const station = getNearestStation(coords)(soundingStations.stations)
      const desiredDate = moment(date)
      // TODO: validate that desiredDate will have a sounding (aka - don't ask for today's evening sounding in the morning)
      const formattedDate = desiredDate.format('YYMMDD')
      const url = `${BASE}/exper/soundings/${formattedDate}${utcTime}_OBS/${station.national_id}.gif`
      return url
    } catch (err) {
      throw new Error(`NOAA - GET SOUNDING ERROR: ${err.message}`)
    }
  }

}

const noaa = new NOAA()
module.exports = noaa
