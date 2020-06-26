const request = require('../utils/request')
const { PersonalWeatherStation: PWS, } = require('../models')

const BASE = 'https://api.ambientweather.net/v1/devices'

class PWSService {

    getDevices = async () => {
        return await PWS.findAll({ include: 'user'})
    }
    
    addDevice = async (device) => {
        const created = await PWS.create(device)
        return created
    }

    removeDevice = async ({ id }) => {
        await PWS.destroy({ where: { id } })
        return { success: true }
    }
    
    getData = async (macAddress, apiKey) => {
        const { AMBIENT_WEATHER_APP_KEY } = process.env
        const url = `${BASE}/${macAddress}?apiKey=${apiKey}&applicationKey=${AMBIENT_WEATHER_APP_KEY}`
        const data = await request(url)
        return data
    }

    getDeviceInfo = async (macAddress, apiKey) => {
        const { AMBIENT_WEATHER_APP_KEY } = process.env
        const url = `${BASE}?apiKey=${apiKey}&applicationKey=${AMBIENT_WEATHER_APP_KEY}`
        const data = await request(url)
        if (Array.isArray(data)) {
            return data.find(dev => dev.macAddress.toLowerCase() === macAddress.toLowerCase())
        } else {
            return { message: 'Something went wrong', data }
        }
    }
}

const pws = new PWSService()

module.exports = pws
