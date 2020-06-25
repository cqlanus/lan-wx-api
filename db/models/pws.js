const Sequelize = require('sequelize')
const sequelize = require('../index')

const PWS = sequelize.define('PersonalWeatherStation', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
    },
    macAddress: Sequelize.STRING,
    apiKey: Sequelize.STRING,
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
    }
}, { freezeTableName: true })


module.exports = PWS
