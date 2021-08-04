const Station = require('../db/models/station')
const json = require('../station_mlid.json')

const seedAll = async () => {
  const promises = json.map(s => {
    console.log({ creating: s.station_name_current })
    return Station.create(s)
  })

  await Promise.all(promises)
  console.log({ done: 1 })

}

module.exports = seedAll
