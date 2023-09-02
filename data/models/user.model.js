const mongoose = require('mongoose')
const config = require('../../config/application.config')
const MongoPaging = require('mongo-cursor-pagination')
const bcrypt = require('bcrypt')
const { bannedHook, softDeleteHook, updatedAtHook } = require('../../utils/database.utils')

const usersSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

usersSchema.statics.verifyExistsUserName = function (userName) {
  return this.exists({ userName: userName.toLowerCase() })
}

usersSchema.statics.generateUserName = async function (userName) {
  const exists = await this.verifyExistsUserName(userName)

  if (exists) {
    return this.generateUserName(`${userName}-${Math.floor(Math.random() * 100)}`)
  }

  return userName
}

usersSchema.statics.reActivate = async function (userId) {
  return await this.updateOne(
    {
      _id: userId,
    },
    {
      $set: {
        disabled: false,
      },
    }
  )
}

usersSchema.statics.populateFull = async function (user) {
  let _user = user.toJSON ? user.toJSON() : user

  return _user
}

usersSchema.plugin(MongoPaging.mongoosePlugin)

usersSchema.pre('findOne', bannedHook)
usersSchema.pre('find', bannedHook)

usersSchema.pre('findOne', softDeleteHook)
usersSchema.pre('find', softDeleteHook)

usersSchema.pre('updateOne', updatedAtHook)
usersSchema.pre('save', updatedAtHook)

// usersSchema.index({ banned: 1, disabled: 1 }, { partialFilterExpression: { disabled: false, banned: false } })
/**
 * @see https://mongoosejs.com/docs/schematypes.html
 */
const User = mongoose.model('User', usersSchema)

module.exports = User
