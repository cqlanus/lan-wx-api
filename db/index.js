const Sequelize = require('sequelize');
const { POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST } = process.env
const connectionURI = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}`
// const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
//   host: POSTGRES_HOST,
//   dialect: 'postgres'
// });
const sequelize = new Sequelize(connectionURI)

module.exports = sequelize
