const Sequelize = require('sequelize');
const { POSTGRES_DB, POSTGRES_USER } = process.env

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: 'postgres',
  dialect: 'postgres'
});

console.log({ POSTGRES_DB, POSTGRES_USER })
console.log({ sequelize })
module.exports = sequelize
