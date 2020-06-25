const request = require('../utils/request')
const Station = require('../db/models/station')

class StationService {
    get = async (icao) => {
        const found = await Station.findOne({ where: { icao } })
        return found
    }
}

const station = new StationService()

module.exports = station
