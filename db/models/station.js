const Sequelize = require('sequelize')
const sequelize = require('../index')
const Station = sequelize.define('station', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
  },
  country3: Sequelize.STRING,
  country2: Sequelize.STRING,
  country: Sequelize.STRING,
  region: Sequelize.STRING,
  subregion: Sequelize.STRING,
  city: Sequelize.STRING,
  station_name_current: Sequelize.STRING,
  station_name_special: Sequelize.STRING,
  stn_key: Sequelize.STRING,
  icao_xref: Sequelize.STRING,
  national_id_xref: Sequelize.STRING,
  wmo_xref: Sequelize.INTEGER,
  wban_xref: Sequelize.INTEGER,
  iata_xref: Sequelize.STRING,
  status: Sequelize.STRING,
  icao: Sequelize.STRING,
  national_id: Sequelize.STRING,
  wmo: Sequelize.STRING,
  maslib: Sequelize.INTEGER,
  wban: Sequelize.INTEGER,
  special: Sequelize.STRING,
  lat_prp: Sequelize.FLOAT,
  lon_prp: Sequelize.FLOAT,
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  }
}, { freezeTableName: true })

module.exports = Station
