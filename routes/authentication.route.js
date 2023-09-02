const express = require('express')
const router = express.Router()
const messages = require('../config/messages.config')
const authMiddleware = require('../middlewares/authentication.middleware')
const validateFieldsMiddleware = require('../middlewares/validateFields.middleware')
const passportJwtModule = require('../modules/authentication/passportJwt.module')
const { sentryCaptureException } = require('../modules/log/sentry.module')
const User = require('../data/models/user.model')
const usersMiddleware = require('../middlewares/users.middleware')
const bcrypt = require('bcrypt')
const { updateDevice } = require('../modules/authentication/device.module')
const { validateEmail } = require('../utils/string.utils')
const config = require('../config/application.config')

router.post(
  '/register',
  validateFieldsMiddleware({
    email: 'required|email',
    password: 'required|string|min:6|max:36',
    userName: 'required|string|min:3|max:36',
  }),
  usersMiddleware.checkUserName,
  usersMiddleware.checkTempEmail,
  usersMiddleware.checkDuplicateEmail,
  authMiddleware.validateCaptcha,
  async (req, res) => {
    try {
      console.time('registerTime')
      const user = await User.create({
        email: req.body.email.toLowerCase(),
        userName: req.body.userName,
        password: await bcrypt.hash(req.body.password, config.bcrypt.numberOfHalts),
      })

      const deviceHash = await updateDevice({
        userId: user._id,
        device: req.body.device,
        ipAddress: req.ip,
        authenticationSource: 'web',
      })

      const token = await passportJwtModule.signJwtToken(user, deviceHash)

      passportJwtModule.setCookie(res, token)

      // @todo send email when user register
      // sendEmailSuccessRegister(user).catch(error => sentryCaptureException(error))

      console.timeEnd('registerTime')
      res.send({
        user: await User.populateFull(user),
        token,
      })
    } catch (err) {
      sentryCaptureException(err)
      res.status(500).send({ message: messages.database_error })
    }
  }
)

router.post(
  '/login',
  validateFieldsMiddleware({
    email: 'required',
    password: 'required|string|min:6|max:36',
  }),
  authMiddleware.validateCaptcha,
  async (req, res) => {
    try {
      const user = await User.collection.findOne({
        email: req.body.email,
      })

      const isPassportValid = await User.verifyPassword(req.body.password, user.password)

      if (!isPassportValid || user.banned) {
        return res.status(401).send({ message: messages.auth_error })
      }

      if (user.disabled) await User.reActivate(user._id)

      delete user.password

      const deviceHash = await updateDevice({
        userId: user._id,
        device: req.body.device,
        ipAddress: req.ip,
        authenticationSource: 'web',
      })

      const token = await passportJwtModule.signJwtToken(user, deviceHash)

      passportJwtModule.setCookie(res, token)

      res.send({
        user: await User.populateFull(user),
        token,
      })
    } catch (err) {
      sentryCaptureException(err)
      res.status(500).send({ message: messages.database_error })
    }
  }
)

router.get('/me', authMiddleware.authenticateJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.send(await User.populateFull(user, req.user))
  } catch (error) {
    sentryCaptureException(error)
    res.status(500).send({ message: messages.database_error })
  }
})

router.post('/logout', authMiddleware.authenticateJwt, (req, res) => {
  res.cookie('access_token')
  return res.sendStatus(200)
})

module.exports = router
