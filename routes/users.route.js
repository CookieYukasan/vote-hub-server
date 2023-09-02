const express = require('express')
const router = express.Router()
const messages = require('../config/messages.config')
const authMiddleware = require('../middlewares/authentication.middleware')
const { sentryCaptureException } = require('../modules/log/sentry.module')
const User = require('../data/models/user.model')
const { sanitizeUserName } = require('../utils/string.utils')
const usersMiddleware = require('../middlewares/users.middleware')
const userPermissions = require('../modules/authorization/permissions/user.permissions')
const validateFieldsMiddleware = require('../middlewares/validateFields.middleware')

router.post(
  '/:id/profile',
  validateFieldsMiddleware({
    userName: 'required|string|min:3|max:16',
  }),
  authMiddleware.authenticateJwt,
  usersMiddleware.getSearchedUser,
  //   usersMiddleware.checkUserName,
  usersMiddleware.checkPermission(userPermissions.CAN_UPDATE),
  async (req, res) => {
    try {
      const user = req.body

      user.userName = user.userName.toLowerCase()

      await User.updateOne(
        { _id: req.searchedUser._id },
        {
          $set: {
            userName: sanitizeUserName(user.userName),
          },
        }
      )

      res.sendStatus(200)
    } catch (error) {
      sentryCaptureException(error)
      res.status(500).send({ message: messages.database_error })
    }
  }
)

module.exports = router
