const { format, subHours } = require('date-fns')
const request = require('../utils/request')
const db = require('../models')
const LINE_STRUCTURE = [
    'date',
    'time',
    'aqsid',
    'sitename',
    'gmtoffset',
    'param',
    'units',
    'value',
    'source',
]
const processData = (data, id) => {
    return data.split('\n')
        .filter(line => line.match(new RegExp(id)))
        .map(line => {
            const arr = line.trim().split('|')
            return arr.reduce((acc, item, idx) => {
                return {
                    ...acc,
                    [LINE_STRUCTURE[idx]]: item,
                }
            }, {})
        })[0]
}

class Air {
    BASE = 'https://s3-us-west-1.amazonaws.com//files.airnowtech.org/airnow/today'

    getStation = async (lat, lon) => {
        const query = `
        SELECT * FROM monitoringstation 
        WHERE param = 'PM2.5' 
        AND status = 'Active' 
        ORDER BY coord <-> ST_GeomFromText ('POINT(${lon} ${lat} )', 4326) 
        LIMIT 5;
        `
        const [results] = await db.sequelize.query(query)
        return results
    }

    getCurrent = async (lat, lon) => {
        const stations = await this.getStation(lat, lon)
        const [station] = stations
        if (!station) { throw new Error('AIR ERROR - NO STATION FOUND') }
        const utcDate = subHours(new Date(), 1)
        const time = format(utcDate, 'yyyyMMddHH')
        const file = `HourlyData_${time}.dat`

        const url = `${this.BASE}/${file}`
        const data = await request(url, {}, false)
        const text = await data.text()
        return processData(text, station.aqsid)
    }
}

module.exports = new Air()
