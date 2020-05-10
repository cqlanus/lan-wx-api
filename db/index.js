const Sequelize = require('sequelize');

const sequelize = new Sequelize('MLID', 'clanus', null, {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize
