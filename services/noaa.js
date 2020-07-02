const moment = require('moment')
const soundingStations = require('../lib/data/sounding-stations.json')

const BASE = 'https://www.spc.noaa.gov'
const SURFACE_BASE = 'https://www.wpc.ncep.noaa.gov/sfc'

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


const isTooEarly = (hour) => {
  const localHour = moment.utc().hours(hour).local().hour()
  const currentHour = moment().hour()
  return (currentHour < localHour)
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
      const isMorning = timeOfDay === 'morning'
      const utcTime = isMorning ? '12' : '00'
      const station = getNearestStation(coords)(soundingStations.stations)
      const isEarly = isTooEarly(+utcTime)
      const desiredDate = (isMorning || isEarly) ? moment(date) : moment(date).add(1, 'day')
      const formattedDate = desiredDate.format('YYMMDD')
      const url = `${BASE}/exper/soundings/${formattedDate}${utcTime}_OBS/${station.national_id}.gif`
      return url
    } catch (err) {
      throw new Error(`NOAA - GET SOUNDING ERROR: ${err.message}`)
    }
  }

  getSurfaceAnalysis = async (utcTime, fronts) => {
    try {
      const country = fronts ? 'us' : 'namus'
      const frontsOnly = fronts ? 'fnt' : ''
      const timeOfDay = utcTime || ''
      const color = 'wbg'

      const mapParams = `${country}${frontsOnly}sfc${timeOfDay}${color}`

      const url = `${SURFACE_BASE}/${mapParams}.gif`
      return url
    } catch (err) {
      throw new Error(`NOAA - GET SURFACE ANALYSIS ERROR: ${err.message}`)
    }
  }

  getModelChart = async (model, product, forecastHour, currentTime) => {
    try {
      const base = 'https://mag.ncep.noaa.gov/data'
      const area = 'conus'
      const imageName = `${model}_${area}_${forecastHour}_${product}.gif`
      const modelRun = getMostRecentForecastRun(currentTime)
      if (model === 'gfs') {
        const url = `${base}/${model}/${modelRun}/${area}/${product}/${imageName}`
        return url
      } else {
        const url = `${base}/${model}/${modelRun}/${imageName}`
        return url
      }

    } catch (err) {
      throw new Error(`NOAA - GET MODEL CHART ERROR: ${err.message}`)
    }
  }

}

const getMostRecentForecastRun = (currentTime) => {
  const modelRuns = [18, 12, 6, 0]
  const currentUtcHour = moment(currentTime).utc().hour()
  return modelRuns.find(run => run <= currentUtcHour)
}

const noaa = new NOAA()
module.exports = noaa
