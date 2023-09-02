const fs = require('fs')
/**
 * Application configurations.
 */
const defaultConfig = {
  app: {
    port: 5000,
    isDev: process.env.NODE_ENV !== 'production',
  },
  mongo: {
    url: 'mongodb://localhost:27017/votehub',
    config: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  bcrypt: {
    numberOfHalts: 8,
  },
  jwt: {
    expiresIn: '7d',
    cookieExpiresIn: 7, // days
    algorithm: 'RS256',
    resetPasswordTokenExpiresIn: '5m',
  },
  balance: {
    defaultPaymentCommissionInPercentage: 70,
  },
  sentry: {
    trackingLink: '', // https://284a63fc35d54706ab3b8b6f9d8ad56b@o1254417.ingest.sentry.io/6422309
  },
  //   nodemailer: {
  //     service: "gmail",
  //     auth: {
  //       type: "OAuth2",
  //       user: "development@cookienetwork.com",
  //       clientId:
  //         "",
  //       clientSecret: "",
  //       refreshToken:
  //         "",
  //     },
  //   },
  email: {
    from: 'no-reply@elojobinfinity.com.br',
    name: 'Elo Job Infinity (no-reply)',
  },
  users: {
    userNameCharsLimit: 16,
    validEmailsDomain: [
      'cookienetwork',
      'gmail',
      'yahoo',
      'hotmail',
      'icloud',
      'protonmail',
      'tutanota',
      'hushmail',
      'fastmail',
      'startmail',
      'posteo',
      'live',
      'uol',
      'aol',
      'mail',
      'gmx',
      'terra',
      'bol',
      'outlook',
    ],
    blacklistedUserNames: ['teste'],
    blacklistedEmailNames: ['test'],
    userNameCharComplementLimit: 6,
  },
  regex: {
    bannedWords: ['puta', 'vagabunda', 'viado', 'whatsapp', 'telegram', 'wa.me', 'whats'],
  },
  session: {
    secret: 'Z6q22P0M1LvLlaDuTzOn44EWJtKTJX9BaKRfiFlzxFfD51ni',
    maxAgeInMS: 600000,
  },
  mercadopago: {
    accessToken: '',
  },
  hcaptcha: {
    secretKey: '0x0Ce37ca5052cdD0853e7f1587Dd70b8e1A8f6899',
    sitekey: 'a539e7a5-2c05-49e0-8a16-7494a40a1b94',
  },
  ngrok: {
    authtoken: '6eXL7Dxk4c5UGGz3a92pB_4DLmM22FjDV8iinRQweyC', // 1rcdBfIZEr8sPleU8i8UAhw7G08_5FzPCipEbQzgXam4RyUq
    subdomain: 'cookienetwork-dev',
  },
  pagination: {
    limit: 10,
  },
  moment: {
    defaultTimezone: 'America/Sao_Paulo',
  },
}

const getEnvConfig = (config, prefix = '') => {
  const _config = Object.assign({}, config)
  const configKeys = Object.keys(_config)

  for (let configKey of configKeys) {
    const currentPrefix = configKey.toUpperCase()
    const appendedPrefix = `${prefix}${currentPrefix}`

    if (!Array.isArray(config[configKey])) {
      _config[configKey] =
        typeof config[configKey] === 'object'
          ? getEnvConfig(config[configKey], `${prefix}${currentPrefix}_`)
          : process.env[appendedPrefix] || _config[configKey]
    }
  }

  return _config
}

module.exports = getEnvConfig(defaultConfig)
