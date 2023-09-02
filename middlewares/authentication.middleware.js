const messages = require('../config/messages.config')
const passport = require('passport')
const config = require('../config/application.config')
const { verify } = require('hcaptcha')
const { sentryCaptureException } = require('../modules/log/sentry.module')

const authUserByRoles = (roles = []) => {
  return (req, res, next) => {
    roles = Array.isArray(roles) ? roles : [roles]

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        message: messages.auth_error,
      })
    }

    next()
  }
}

module.exports = {
  authenticateJwt: (req, res, next) => {
    passport.authenticate(
      'jwt',
      {
        session: false,
      },
      (err, user, info) => {
        if (err) {
          res.cookie('access_token')
          return res.status(403).json({
            message: messages.random_error,
          })
        }

        if (!user) {
          res.cookie('access_token')
          return res.status(403).json({
            message: messages.auth_error,
          })
        }

        req.user = user

        next()
      }
    )(req, res, next)
  },
  tryAuthenticateJwt: (req, res, next) => {
    passport.authenticate(
      'jwt',
      {
        session: false,
      },
      (err, user, info) => {
        if (err) {
          res.cookie('access_token')
          return res.status(403).json({
            message: messages.random_error,
          })
        }

        req.user = user

        next()
      }
    )(req, res, next)
  },
  validateCaptcha: async (req, res, next) => {
    try {
      if (config.app.isDev) return next()

      const secretCaptcha = config.hcaptcha.secretKey
      const tokenCaptcha = req.body.token
      const data = await verify(secretCaptcha, tokenCaptcha)

      if (!data.success) return res.sendStatus(403)

      next()
    } catch (error) {
      sentryCaptureException(error)
      return res.status(500).send({ message: messages.database_error })
    }
  },
  authorizeAdmin: authUserByRoles(),
  authorizeCreator: authUserByRoles('creator'),
  authorizeService: serviceToken => (req, res, next) => {
    const token = req.headers['x-service-token']

    if (token !== serviceToken) {
      return res.sendStatus(403)
    }

    next()
  },
}
