const messages = require('../config/messages.config')
const config = require('../config/application.config')
const userAuthorizationModule = require('../modules/authorization/handlers/user.authorization.module')
const User = require('../data/models/user.model')
const { getHandlerResponse } = require('../modules/authorization/authorization.utils')
const { checkBannedWord } = require('../utils/string.utils')
const { sentryCaptureException } = require('../modules/log/sentry.module')

module.exports = {
  getSearchedUser: async (req, res, next) => {
    try {
      req.searchedUser = await User.findById(req.params.id)

      if (!req.searchedUser) {
        return res.sendStatus(204)
      }

      next()
    } catch (err) {
      sentryCaptureException(err)
      return res.status(500).send({ message: messages.database_error })
    }
  },
  checkPermission: permissionKey => {
    return async (req, res, next) => {
      try {
        if (!getHandlerResponse(userAuthorizationModule, permissionKey, req.user, req.searchedUser)) {
          return res.sendStatus(403)
        }

        next()
      } catch (err) {
        sentryCaptureException(err)
        return res.status(500).send({ message: messages.database_error })
      }
    }
  },
  checkUserName: async (req, res, next) => {
    if (req.body.userName) {
      if (config.users.blacklistedUserNames.indexOf(req.body.userName.toLowerCase()) !== -1) {
        return res.status(400).send({ duplicatedField: 'userName' })
      }

      if (checkBannedWord(req.body.userName)) {
        return res.status(400).send({ duplicatedField: 'userName' })
      }

      const userWithUserName = await User.collection.findOne({
        userName: req.body.userName,
      })

      if (userWithUserName && !userWithUserName._id.equals(req.user?._id)) {
        return res.status(400).send({ duplicatedField: 'userName' })
      }
    }

    next()
  },
  checkDuplicateEmail: async (req, res, next) => {
    try {
      if (req.body.email) {
        const userWithEmail = await User.collection.findOne({
          email: req.body.email,
        })

        if (userWithEmail && (!req.user || !userWithEmail._id.equals(req.user._id))) {
          return res.status(400).send({ duplicatedField: 'email' })
        }
      }

      next()
    } catch (error) {
      sentryCaptureException(error)
      return res.status(500).send({ message: messages.database_error })
    }
  },
  checkTempEmail: async (req, res, next) => {
    try {
      if (req.body.email) {
        const getEmailBeforeAt = req.body.email.split('@')[0]
        const isValidEmailName = !config.users.blacklistedEmailNames.includes(getEmailBeforeAt)

        if (isValidEmailName) {
          const getDomain = req.body.email.split('@')[1].split('.')[0]
          const isValidDomain = config.users.validEmailsDomain.includes(getDomain.toLowerCase())

          if (!isValidDomain) {
            return res.sendStatus(403)
          }
        }

        if (!isValidEmailName) {
          return res.sendStatus(403)
        }
      }

      next()
    } catch (error) {
      sentryCaptureException(error)
      return res.status(500).send({ message: messages.database_error })
    }
  },
}
