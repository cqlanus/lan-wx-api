const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const compress = require('compression')

const logger = require('./lib/logger')
const errorHandler = require('./lib/errorHandler')

const currentRouter = require('./routes/current')
const forecastRouter = require('./routes/forecast')
const zipRouter = require('./routes/zip')

require('dotenv').config()

const app = express()

// Global middlewares
app.use(logger)
app.use(compress())
app.use(bodyParser.json())

// Routers
app.use('/current', currentRouter)
app.use('/forecast', forecastRouter)
app.use('/zip', zipRouter)
app.use('*', () => {
  throw new Error('wrong')
})


// Error handler
app.use(errorHandler)

const server = http.createServer(app)

const { PORT = 9000 } = process.env
server.listen(PORT, () => console.log(`Listening on ${PORT}`))
