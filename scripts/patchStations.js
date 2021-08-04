const { Op } = require('sequelize')
const Station = require('../db/models/station')

const stationsMissingIcao = [
    {
        predicate: {
            where: {
                stn_key: {
                    [Op.like]: '%ILX'
                }
            }
        },
        update: {
            icao: 'KILX',
            icao_xref: 'KILX',
            national_id: 'ILX'
        }
    }
 ]

const patchStations = async () => {
    const promises = stationsMissingIcao.map(async s => {
        const foundStation = await Station.findOne(s.predicate)
        const updatedStation = await foundStation.update(s.update)
        console.log({ icao: updatedStation.icao })
    })
    await Promise.all(promises)
    console.log({ done: 1 })
}

patchStations()
