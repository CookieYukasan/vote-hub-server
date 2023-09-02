const ngrok = require('ngrok')
const config = require('../../config/application.config')
/**
 * Set up ngrok to test the webhooks in development.
 */
;(async function () {
  try {
    const url = await ngrok.connect({
      proto: 'http',
      addr: config.app.port,
      authtoken: config.ngrok.authtoken,
      // subdomain: config.ngrok.subdomain,
    })

    console.log('ngrok running', url)
  } catch (err) {
    console.error('Error while connecting Ngrok', err)
  }
})()
