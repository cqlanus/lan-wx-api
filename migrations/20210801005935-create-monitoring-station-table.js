'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('monitoringstation', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
        type: Sequelize.UUID
      },
      aqsid: Sequelize.STRING,
      param: Sequelize.STRING,
      site_code: Sequelize.STRING,
      site_name: Sequelize.STRING,
      status: Sequelize.STRING,
      agency_id: Sequelize.STRING,
      agency_name: Sequelize.STRING,
      epa_region: Sequelize.STRING,
      latitude: Sequelize.FLOAT,
      longitude: Sequelize.FLOAT,
      coord: Sequelize.GEOMETRY('POINT', 4326),
      elevation: Sequelize.STRING,
      gmt_offset: Sequelize.STRING,
      country_code: Sequelize.STRING,
      msa_code: Sequelize.STRING,
      msa_name: Sequelize.STRING,
      state_code: Sequelize.STRING,
      state_name: Sequelize.STRING,
      county_code: Sequelize.STRING,
      county_name: Sequelize.STRING,
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      }
    })
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('monitoringstation')
  }
};
