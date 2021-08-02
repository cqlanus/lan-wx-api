const { v4: uuidv4 } = require('uuid');
const monitoringStations = require('../lib/data/monitoring-stations.json')

module.exports = {
  up: (queryInterface, Sequelize) => {
    const stations = monitoringStations.filter(s => s.latitude).map(s => ({
      ...s,
      id: uuidv4(),
      coord: Sequelize.fn('ST_GeomFromText', `POINT(${s.longitude} ${s.latitude})`, 4326),
    }))
    return queryInterface.bulkInsert("monitoringstation", stations)
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('monitoringstation', null, {})
  }
};
