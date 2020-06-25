const { v4: uuidv4 } = require('uuid');
const allStations = require('../station_mlid.json')

module.exports = {
  up: (queryInterface) => {
    const stations = allStations.map(s => ({ ...s, id: uuidv4() }))
    return queryInterface.bulkInsert('station', stations)
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('station', null, {})
  }
};
