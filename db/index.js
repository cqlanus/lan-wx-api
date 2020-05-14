const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, null, {
  host: 'postgres',
  dialect: 'postgres'
});

module.exports = sequelize
