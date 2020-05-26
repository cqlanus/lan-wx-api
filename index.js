// const http = require('http')
const fs = require('fs')
const https = require('https')
const express = require('express')
const bodyParser = require('body-parser')
const compress = require('compression')
const cors = require('cors')

const logger = require('./lib/logger')
const errorHandler = require('./lib/errorHandler')
const corsMiddleware = require('./lib/cors')

const currentRouter = require('./routes/current')
const forecastRouter = require('./routes/forecast')
const zipRouter = require('./routes/zip')
const normsRouter = require('./routes/norms')
const chartsRouter = require('./routes/charts')

require('dotenv').config()

const app = express(cors())

// Global middlewares
app.use(logger)
app.use(compress())
app.use(bodyParser.json())
app.use(corsMiddleware)

// Routers
app.use('/current', currentRouter)
app.use('/forecast', forecastRouter)
app.use('/norms', normsRouter)
app.use('/zip', zipRouter)
app.use('/charts', chartsRouter)
app.use('*', () => {
  throw new Error('wrong')
})


// Error handler
app.use(errorHandler)

// const server = http.createServer(app)
const options = {
  key: fs.readFileSync( process.env.HTTPS_KEY ),
  cert: fs.readFileSync( process.env.HTTPS_CERT )
}
const server = https.createServer(options, app)

const { PORT = 9000 } = process.env
server.listen(PORT, () => console.log(`Listening on ${PORT}`))
