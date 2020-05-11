const fs = require('fs').promises
const request = require('../utils/request')
const { Op } = require('sequelize')
const Station = require('../db/models/station')
const locationsUrl = 'https://api.weather.gov/products/types/ABV/locations/'

const getStation = async ([ stationId, name ]) => {
  const query1 = async () => {
    return await Station.findOne({
      where: {
        icao: `K${stationId}`
      }
    })
  }
  const query2 = async () => {
    return await Station.findOne({
      where: {
        stn_key: {
          [Op.like]: `%K${stationId}`
        }
      }
    })
  }
  let found = await query1()

  if (!found) {
    found = await query2()
  }

  if (found) {
    const { region, city, icao, wban, lat_prp, lon_prp, station_name_current, special, national_id } = found
    return { region, city, icao, wban, lat_prp, lon_prp, station_name_current, special, name, national_id }
  }
}

const organizeStationsByState = stations => {
  return stations.reduce((acc, station) => {
    const existing = acc[station.region] || []
    return {
      ...acc,
      [station.region]: [ ...existing, station ]
    }
  }, {})
}

const getStations = async () => {
  const { locations } = await request(locationsUrl)
  const promises = Object.entries(locations).map(getStation)
  const foundStations = await Promise.all(promises)
  const totalFound = foundStations.filter(Boolean)
  const organized = organizeStationsByState(totalFound)
  const totalObj = {
    byState: organized,
    stations: totalFound
  }
  await fs.writeFile('./lib/data/sounding-stations.json', JSON.stringify(totalObj))
  return totalFound
}

getStations()
