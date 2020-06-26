const request = require('../utils/request')
const { User, UsersStation } = require('../models')

class UserService {
    create = async (username) => {
        const user = await User.create({ username })
        return user
    }
    getUser = async (username) => {
        const user = await User.findOne({
            where: { username },
            include: [ 'pws', 'stations' ]
        })
        return user;
    }
    update = async () => {}

    getFavoriteStations = async (userId) => {
        const stations = await UsersStation.findAll({ where: { userId }, include: 'station' })
        return stations
    }

    setFavoriteStation = async ({ userId, stationId }) => {
        const favorited = await UsersStation.create({ userId, stationId })
        return favorited
    }

    removeFavoriteStation = async (stationId) => {
        await UsersStation.destroy({ where: { stationId } })
        return { success: true }
    }
}

const user = new UserService()
module.exports = user
