const { promisify } = require('util')
const redis = require('redis')

const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)

client.on('connect', () => {
    console.log('redis connected')
})

const redisGet = promisify(client.get).bind(client)
const redisSet = promisify(client.set).bind(client)

module.exports = {
    redisGet,
    redisSet,
}
