const Sequelize = require('sequelize')
const sequelize = require('../index')

const User = sequelize.define('User', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
    },
    username: Sequelize.STRING,
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
    }

}, { freezeTableName: true })

module.exports = User
