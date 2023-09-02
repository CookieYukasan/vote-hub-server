const jwtStrategy = require('passport-jwt').Strategy
const fs = require('fs')
const config = require('../../config/application.config')
const KEY_PATH = `${__dirname}/../../keys/`
const jsonwebtoken = require('jsonwebtoken')
const User = require('../../data/models/user.model')
/**
 * Load key in memory in order to prevent bottleneck reading the same file over and over again.
 */
let publicKey = process.env.PUBLIC_JWT_KEY
let privateKey = process.env.PRIVATE_JWT_KEY

module.exports.setupPassport = async function (passport) {
  passport.use(
    new jwtStrategy(
      {
        jwtFromRequest: req => {
          let token = null

          if (req && req.cookies) {
            token = req.cookies['access_token']
          }

          return token
        },
        secretOrKey: await this.getPublicKey(),
        algorithms: [config.jwt.algorithm],
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.sub)
          if (!user) {
            return done(null, false)
          }

          if (payload.deviceHash !== user.device.hash) {
            return done(null, false)
          }

          done(null, user)
        } catch (err) {
          done(err)
        }
      }
    )
  )
}

module.exports.getPublicKey = async () => {
  if (publicKey) {
    return publicKey
  }

  publicKey = await readFileAsPromise(`${KEY_PATH}id_rsa_pub.pem`)
  return publicKey
}

module.exports.getPrivateKey = async () => {
  if (privateKey) {
    return privateKey
  }

  privateKey = await readFileAsPromise(`${KEY_PATH}id_rsa_priv.pem`)
  return privateKey
}

module.exports.signJwtToken = async function (userId, deviceHash) {
  return jsonwebtoken.sign(
    {
      sub: userId,
      deviceHash,
    },
    await this.getPrivateKey(),
    {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.expiresIn,
    }
  )
}

module.exports.setCookie = function (res, token) {
  return res.cookie('access_token', token, {
    maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: !config.app.isDev,
  })
}

const readFileAsPromise = (filePath, decode = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, decode, (err, key) => {
      if (err) {
        return reject(err)
      }
      resolve(key)
    })
  })
}

;(async function () {
  module.exports.getPublicKey()
  module.exports.getPrivateKey()
})()
