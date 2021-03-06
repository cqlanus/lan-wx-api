// const http = require('http')
const fs = require('fs')
const https = require('https')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const compress = require('compression')
const cors = require('cors')

const app = express(cors())

require('dotenv').config()

const logger = require('./lib/logger')
const errorHandler = require('./lib/errorHandler')
const corsMiddleware = require('./lib/cors')

const currentRouter = require('./routes/current')
const recentRouter = require('./routes/recent')
const forecastRouter = require('./routes/forecast')
const zipRouter = require('./routes/zip')
const normsRouter = require('./routes/norms')
const chartsRouter = require('./routes/charts')
const almanacRouter = require('./routes/almanac')
const astroRouter = require('./routes/astronomy')
const locationRouter = require('./routes/location')
const pwsRouter = require('./routes/pws')
const userRouter = require('./routes/user')
const stationRouter = require('./routes/station')

// Global middlewares
app.use(logger)
app.use(compress())
app.use(bodyParser.json())
app.use(corsMiddleware)

// Routers
app.get('/', (req, res) => {
  res.json({ success: 1 })
})
app.use('/current', currentRouter)
app.use('/recent', recentRouter)
app.use('/forecast', forecastRouter)
app.use('/norms', normsRouter)
app.use('/zip', zipRouter)
app.use('/charts', chartsRouter)
app.use('/almanac', almanacRouter)
app.use('/astronomy', astroRouter)
app.use('/location', locationRouter)
app.use('/pws', pwsRouter)
app.use('/user', userRouter)
app.use('/station', stationRouter)
app.use('*', () => {
  throw new Error('wrong')
})


// Error handler
app.use(errorHandler)

const makeServer = () => {
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    return http.createServer(app)
  } else {
    const options = {
      key: fs.readFileSync( process.env.HTTPS_KEY ),
      cert: fs.readFileSync( process.env.HTTPS_CERT )
    }
    return https.createServer(options, app)
    
  }
}

const server = makeServer()

const { PORT = 9000 } = process.env
server.listen(+PORT, () => console.log(`Listening on ${PORT}`))
