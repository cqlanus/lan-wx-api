const allStations = require('../station_mlid.json')

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('station', allStations)
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('station', null, {})
  }
};
