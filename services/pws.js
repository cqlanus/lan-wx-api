const request = require('../utils/request')

const BASE = 'https://api.ambientweather.net/v1/devices'

class PWS {
    
    getData = async (macAddress, apiKey) => {
        const { AMBIENT_WEATHER_APP_KEY } = process.env
        const url = `${BASE}/${macAddress}?apiKey=${apiKey}&applicationKey=${AMBIENT_WEATHER_APP_KEY}`
        const data = await request(url)
        return data
    }
}

const pws = new PWS()

module.exports = pws
