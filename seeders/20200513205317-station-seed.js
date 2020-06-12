const { v4: uuidv4 } = require('uuid');
const allStations = require('../station_mlid.json')

module.exports = {
  up: (queryInterface) => {
    console.log({ HERE: 1 })
    const stations = allStations.map(s => ({ ...s, id: uuidv4() }))
    console.log({ HERE: 2 })
    return queryInterface.bulkInsert('station', stations)
  },

  down: (queryInterface) => {
    console.log({ HERE: 3 })
    return queryInterface.bulkDelete('station', null, {})
  }
};
