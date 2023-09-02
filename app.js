/**
 * Load all the models first so we avoid races conditions.
 */
require('./data')
/**
 * Load all the required modules.
 */
const express = require('express')
const app = express()
const config = require('./config/application.config')
const messages = require('./config/messages.config')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const moment = require('moment-timezone')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const passport = require('passport')
const passportJwtModule = require('./modules/authentication/passportJwt.module')
const AuthController = require('./routes/authentication.route')
const UsersController = require('./routes/users.route')
/**
 * Set moment timezone
 */
moment.tz.setDefault(config.moment.defaultTimezone)
/**
 * Set up the MongoDB connection.
 */
mongoose.connect(config.mongo.url, config.mongo.config, err => {
  if (err) {
    console.error(err)
    process.exit()
  }

  console.log('MongoDB connected with success')
})
/**
 * Debug
 */
if (config.app.isDev) {
  app.use(morgan('dev'))
}
/**
 * API Security.
 * @see https://helmetjs.github.io
 */
app.use(helmet())
/**
 * Set cookies.
 */
app.use(cookieParser())
/**
 * CORS
 */
app.use(
  cors({
    credentials: true,
    origin: config.app.isDev ? true : config.app.clientUrl,
  })
)
/**
 * Load the json module to parse POST and PUT request.
 */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
/**
 * Init session middleware, this is only used on twitter integration.
 */
app.use(
  cookieSession({
    name: 'session',
    keys: [config.session.secret],
    secure: !config.app.isDev,
    httpOnly: true,
    maxAge: config.session.maxAgeInMS,
  })
)
/**
 * Init passport.
 */
app.use(passport.initialize())
app.use(passport.session())
/**
 * Init passport local configuration.
 */
passportJwtModule.setupPassport(passport)
/**
 * Load all the controllers
 */
app.use('/auth', AuthController)
app.use('/users', UsersController)
/**
 * Handle 404 requests.
 */
app.use((req, res) => {
  res.status(404).send({ message: messages.not_found })
})

module.exports = app
