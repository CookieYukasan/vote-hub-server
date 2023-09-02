const mongoose = require('mongoose')
const User = mongoose.model('User')
const crypto = require('crypto')

module.exports.updateDevice = async ({ userId, device, ipAddress, authenticationSource }) => {
  let deviceString = `${ipAddress}_${authenticationSource}`

  if (authenticationSource === 'web') {
    deviceString = `${ipAddress}_${authenticationSource}_${device.os.name}_${device.platform.type}`
  }

  const deviceHash = crypto.createHash('md5').update(deviceString).digest('hex')

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        device: {
          browser:
            device && device.browser
              ? {
                  name: device.browser.name,
                  version: device.browser.version,
                }
              : null,
          os:
            device && device.os
              ? {
                  name: device.os.name,
                  version: device.os.version,
                }
              : null,
          platform:
            device && device.platform
              ? {
                  type: device.platform.type,
                  vendor: device.platform.vendor,
                  model: device.platform.model,
                }
              : null,
          ipAddress,
          authenticationSource,
          hash: deviceHash,
        },
      },
    }
  )

  return deviceHash
}
